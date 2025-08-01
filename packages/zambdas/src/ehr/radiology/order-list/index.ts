import Oystehr from '@oystehr/sdk';
import { APIGatewayProxyResult } from 'aws-lambda';
import { Appointment, DiagnosticReport, Encounter, Practitioner, ServiceRequest, Task } from 'fhir/r4b';
import {
  GetRadiologyOrderListZambdaInput,
  GetRadiologyOrderListZambdaOrder,
  GetRadiologyOrderListZambdaOutput,
  isPositiveNumberOrZero,
  Pagination,
  RadiologyOrderHistoryRow,
  RadiologyOrderStatus,
  RoleType,
  Secrets,
  User,
} from 'utils';
import { checkOrCreateM2MClientToken, createOystehrClient, ZambdaInput } from '../../../shared';
import {
  DIAGNOSTIC_REPORT_PRELIMINARY_REVIEW_ON_EXTENSION_URL,
  ORDER_TYPE_CODE_SYSTEM,
  SERVICE_REQUEST_PERFORMED_ON_EXTENSION_URL,
  SERVICE_REQUEST_REQUESTED_TIME_EXTENSION_URL,
} from '../shared';
import { validateInput, validateSecrets } from './validation';

// Types
export interface ValidatedInput {
  body: Omit<GetRadiologyOrderListZambdaInput, 'encounterIds'> & { encounterIds?: string[] };
  callerAccessToken: string;
}

export const DEFAULT_RADIOLOGY_ITEMS_PER_PAGE = 10;

// Lifting up value to outside of the handler allows it to stay in memory across warm lambda invocations
let m2mToken: string;

export const index = async (unsafeInput: ZambdaInput): Promise<APIGatewayProxyResult> => {
  try {
    const secrets = validateSecrets(unsafeInput.secrets);

    m2mToken = await checkOrCreateM2MClientToken(m2mToken, secrets);
    const oystehr = createOystehrClient(m2mToken, secrets);

    const validatedInput = await validateInput(unsafeInput);

    await accessCheck(validatedInput.callerAccessToken, secrets);

    const response = await performEffect(validatedInput, oystehr);

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error: any) {
    console.log('Error: ', JSON.stringify(error.message));
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

const accessCheck = async (callerAccessToken: string, secrets: Secrets): Promise<void> => {
  const callerUser = await getCallerUserWithAccessToken(callerAccessToken, secrets);

  if (callerUser.profile.indexOf('Practitioner/') === -1) {
    throw new Error('Caller does not have a practitioner profile');
  }
  if (callerUser.roles?.find((role) => role.name === RoleType.Provider) === undefined) {
    throw new Error('Caller does not have provider role');
  }
};

const getCallerUserWithAccessToken = async (token: string, secrets: Secrets): Promise<User> => {
  const oystehr = createOystehrClient(token, secrets);
  return await oystehr.user.me();
};

const performEffect = async (
  validatedInput: ValidatedInput,
  oystehr: Oystehr
): Promise<GetRadiologyOrderListZambdaOutput> => {
  const {
    encounterIds,
    patientId,
    serviceRequestId,
    itemsPerPage = DEFAULT_RADIOLOGY_ITEMS_PER_PAGE,
    pageIndex = 0,
  } = validatedInput.body;

  const searchParams = [
    {
      name: '_total',
      value: 'accurate',
    },
    {
      name: '_offset',
      value: `${pageIndex * itemsPerPage}`,
    },
    {
      name: '_count',
      value: `${itemsPerPage}`,
    },
    {
      name: '_sort',
      value: '-_lastUpdated',
    },
    {
      name: '_revinclude',
      value: 'Task:based-on',
    },
    {
      name: '_revinclude',
      value: 'DiagnosticReport:based-on',
    },
    {
      name: '_include',
      value: 'ServiceRequest:requester',
    },
    {
      name: '_include',
      value: 'ServiceRequest:encounter',
    },
    {
      name: '_include',
      value: 'ServiceRequest:encounter',
    },
    {
      name: '_tag',
      value: `${ORDER_TYPE_CODE_SYSTEM}|radiology`,
    },
    {
      name: 'status:not',
      value: 'revoked',
    },
  ];

  if (patientId) {
    searchParams.push({
      name: 'subject',
      value: `Patient/${patientId}`,
    });
  } else if (serviceRequestId) {
    searchParams.push({
      name: '_id',
      value: serviceRequestId,
    });
  } else if (encounterIds) {
    searchParams.push({
      name: 'encounter',
      value: encounterIds.map((id) => `Encounter/${id}`).join(','),
    });
  } else {
    throw new Error('Either encounterId or patientId must be provided, should not happen if validation step worked');
  }

  const searchResponse = await oystehr.fhir.search({
    resourceType: 'ServiceRequest',
    params: searchParams,
  });

  console.log('searchResponse', JSON.stringify(searchResponse, null, 2));

  const resources =
    searchResponse.entry
      ?.map((entry) => entry.resource)
      .filter((res): res is ServiceRequest | Task | Practitioner | DiagnosticReport | Encounter => Boolean(res)) || [];

  const { serviceRequests, tasks, diagnosticReports, practitioners, encounters } = extractResources(resources);

  if (!serviceRequests.length) {
    return {
      orders: [],
      pagination: EMPTY_PAGINATION,
    };
  }

  const orders = serviceRequests.map((serviceRequest) =>
    parseResultsToOrder(serviceRequest, tasks, diagnosticReports, practitioners, encounters)
  );

  return {
    orders,
    pagination: parsePaginationFromResponse(searchResponse),
  };
};

const parseResultsToOrder = (
  serviceRequest: ServiceRequest,
  tasks: Task[],
  diagnosticReports: DiagnosticReport[],
  practitioners: Practitioner[],
  encounters: Encounter[]
): GetRadiologyOrderListZambdaOrder => {
  if (serviceRequest.id == null) {
    throw new Error('ServiceRequest ID is unexpectedly null');
  }

  const cptCode = serviceRequest.code?.coding?.[0]?.code;
  if (!cptCode) {
    throw new Error('cptCode is unexpectedly null');
  }

  const diagnosisCode = serviceRequest.reasonCode?.[0]?.coding?.[0]?.code;
  if (!diagnosisCode) {
    throw new Error('diagnosisCode is unexpectedly null');
  }

  const diagnosisDisplay = serviceRequest.reasonCode?.[0]?.coding?.[0]?.display;
  if (!diagnosisDisplay) {
    throw new Error('diagnosisDisplay is unexpectedly null');
  }

  const cptCodeDisplay = serviceRequest.code?.coding?.[0]?.display;
  if (!cptCodeDisplay) {
    throw new Error('cptCodeDisplay is unexpectedly null');
  }

  const orderAddedDateTime = serviceRequest.authoredOn;
  if (!orderAddedDateTime) {
    throw new Error('Order added date time is unexpectedly null');
  }

  const myRequestingProvider = practitioners.find(
    (practitioner) => practitioner.id === serviceRequest.requester?.reference?.split('/')[1]
  );
  if (!myRequestingProvider) {
    throw new Error('Service Request has no requesting provider');
  }
  const providerFirstName = myRequestingProvider?.name?.[0]?.given?.[0];
  const providerLastName = myRequestingProvider?.name?.[0]?.family;
  if (!providerFirstName || !providerLastName) {
    throw new Error('Provider name is unexpectedly null');
  }
  const providerName = `${providerLastName}, ${providerFirstName}`;

  // TODO can we do provider requesting provider qualifications to render "MD"?

  let status: RadiologyOrderStatus | undefined;

  // TODO add task for 'reviewed' feature.
  // const myReviewTask = tasks.find((task) => {
  //   task.basedOn?.some((basedOn) => basedOn.reference === `ServiceRequest/${serviceRequest.id}`);
  // });

  const myDiagnosticReport = diagnosticReports.find(
    (report) => report.basedOn?.some((basedOn) => basedOn.reference === `ServiceRequest/${serviceRequest.id}`)
  );

  const result = myDiagnosticReport?.presentedForm?.find((attachment) => attachment.contentType === 'text/html')?.data;

  if (serviceRequest.status === 'active') {
    status = RadiologyOrderStatus.pending;
  } else if (serviceRequest.status === 'completed' && !myDiagnosticReport) {
    status = RadiologyOrderStatus.performed;
  } else if (myDiagnosticReport?.status === 'preliminary') {
    status = RadiologyOrderStatus.preliminary;
  } else if (myDiagnosticReport?.status === 'final') {
    // && myReviewTask?.status === 'ready') {
    status = RadiologyOrderStatus.final;
    // } else if (myReviewTask?.status === 'completed') {
    //   status = RadiologyOrderStatus.reviewed;
  } else {
    throw new Error('Order is in an invalid state, could not determine status.');
  }

  const appointmentId = parseAppointmentId(serviceRequest, encounters);

  const history = buildHistory(serviceRequest, myDiagnosticReport, providerName);

  return {
    serviceRequestId: serviceRequest.id,
    appointmentId,
    studyType: `${cptCode} — ${cptCodeDisplay}`,
    visitDateTime: '', // TODO
    orderAddedDateTime,
    providerName,
    diagnosis: `${diagnosisCode} — ${diagnosisDisplay}`,
    status,
    isStat: serviceRequest.priority === 'stat',
    result,
    history,
  };
};

const buildHistory = (
  serviceRequest: ServiceRequest,
  diagnosticReport: DiagnosticReport | undefined,
  orderingProviderName: string
): RadiologyOrderHistoryRow[] => {
  const history: RadiologyOrderHistoryRow[] = [];

  const requestedTimeExtensionValue = serviceRequest.extension?.find(
    (ext) => ext.url === SERVICE_REQUEST_REQUESTED_TIME_EXTENSION_URL
  )?.valueDateTime;
  if (requestedTimeExtensionValue) {
    history.push({
      status: RadiologyOrderStatus.pending,
      performer: orderingProviderName,
      date: requestedTimeExtensionValue,
    });
  }

  const performedHistoryExtensionValue = serviceRequest.extension?.find(
    (ext) => ext.url === SERVICE_REQUEST_PERFORMED_ON_EXTENSION_URL
  )?.valueDateTime;
  if (performedHistoryExtensionValue) {
    history.push({
      status: RadiologyOrderStatus.performed,
      performer: 'See AdvaPACS',
      date: performedHistoryExtensionValue,
    });
  }

  const diagnosticReportPreliminaryReadTimeExtensionValue = diagnosticReport?.extension?.find(
    (ext) => ext.url === DIAGNOSTIC_REPORT_PRELIMINARY_REVIEW_ON_EXTENSION_URL
  )?.valueDateTime;
  if (diagnosticReportPreliminaryReadTimeExtensionValue) {
    history.push({
      status: RadiologyOrderStatus.preliminary,
      performer: 'See AdvaPACS',
      date: diagnosticReportPreliminaryReadTimeExtensionValue,
    });
  }

  if (diagnosticReport?.issued) {
    history.push({
      status: RadiologyOrderStatus.final,
      performer: 'See AdvaPACS',
      date: diagnosticReport.issued,
    });
  }

  return history;
};

const extractResources = (
  resources: (ServiceRequest | Task | Practitioner | DiagnosticReport | Encounter | Appointment)[]
): {
  serviceRequests: ServiceRequest[];
  tasks: Task[];
  diagnosticReports: DiagnosticReport[];
  practitioners: Practitioner[];
  encounters: Encounter[];
} => {
  const serviceRequests: ServiceRequest[] = [];
  const tasks: Task[] = [];
  const results: DiagnosticReport[] = [];
  const practitioners: Practitioner[] = [];
  const encounters: Encounter[] = [];

  for (const resource of resources) {
    if (resource.resourceType === 'ServiceRequest') {
      serviceRequests.push(resource as ServiceRequest);
    } else if (resource.resourceType === 'Task') {
      tasks.push(resource as Task);
    } else if (resource.resourceType === 'DiagnosticReport') {
      results.push(resource as DiagnosticReport);
    } else if (resource.resourceType === 'Practitioner') {
      practitioners.push(resource as Practitioner);
    } else if (resource.resourceType === 'Encounter') {
      encounters.push(resource as Encounter);
    }
  }

  return {
    serviceRequests,
    tasks,
    diagnosticReports: results,
    practitioners,
    encounters,
  };
};

export const EMPTY_PAGINATION: Pagination = {
  currentPageIndex: 0,
  totalItems: 0,
  totalPages: 0,
};

export const parsePaginationFromResponse = (data: {
  total?: number;
  link?: Array<{ relation: string; url: string }>;
}): Pagination => {
  if (!data || typeof data.total !== 'number' || !Array.isArray(data.link)) {
    return EMPTY_PAGINATION;
  }

  const selfLink = data.link.find((link) => link && link.relation === 'self');

  if (!selfLink || !selfLink.url) {
    return EMPTY_PAGINATION;
  }

  const totalItems = data.total;
  const selfUrl = new URL(selfLink.url);
  const itemsPerPageStr = selfUrl.searchParams.get('_count');

  if (!itemsPerPageStr) {
    return EMPTY_PAGINATION;
  }

  const itemsPerPage = parseInt(itemsPerPageStr, 10);

  if (!isPositiveNumberOrZero(itemsPerPage)) {
    return EMPTY_PAGINATION;
  }

  const selfOffsetStr = selfUrl.searchParams.get('_offset');
  const selfOffset = selfOffsetStr ? parseInt(selfOffsetStr, 10) : 0;
  const currentPageIndex = !isNaN(selfOffset) ? Math.floor(selfOffset / itemsPerPage) : 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    currentPageIndex,
    totalItems,
    totalPages,
  };
};

export const parseAppointmentId = (serviceRequest: ServiceRequest, encounters: Encounter[]): string => {
  const encounterId = parseEncounterId(serviceRequest);
  const NOT_FOUND = '';

  if (!encounterId) {
    return NOT_FOUND;
  }

  const relatedEncounter = encounters.find((encounter) => encounter.id === encounterId);

  if (relatedEncounter?.appointment?.length) {
    return relatedEncounter.appointment[0]?.reference?.split('/').pop() || NOT_FOUND;
  }

  return NOT_FOUND;
};

const parseEncounterId = (serviceRequest: ServiceRequest): string => {
  const NOT_FOUND = '';
  return serviceRequest.encounter?.reference?.split('/').pop() || NOT_FOUND;
};
