import { Extension, Location, Organization } from 'fhir/r4b';
import { useMutation, useQuery } from 'react-query';
import {
  FHIR_EXTENSION,
  INSURANCE_SETTINGS_MAP,
  isLocationVirtual,
  ORG_TYPE_CODE_SYSTEM,
  ORG_TYPE_PAYER_CODE,
} from 'utils';
import { useApiClients } from '../../../hooks/useAppClients';
import { InsuranceData } from './EditInsurance';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useStatesQuery = () => {
  const { oystehr } = useApiClients();

  return useQuery(
    ['state-locations', { oystehr }],
    async () => {
      const resources = await oystehr!.fhir.search<Location>({
        resourceType: 'Location',
        params: [
          {
            name: 'address-state:missing',
            value: 'false',
          },
        ],
      });

      return resources.unbundle().filter(isLocationVirtual);
    },
    {
      enabled: !!oystehr,
    }
  );
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useInsurancesQuery = (id?: string, enabled?: boolean) => {
  const { oystehr } = useApiClients();

  return useQuery(
    ['insurances', { oystehr, id }],
    async () => {
      const searchParams = [];
      let offset = 0;
      if (id) {
        searchParams.push({
          name: '_id',
          value: id,
        });
      }
      searchParams.push(
        {
          name: '_count',
          value: '1000',
        },
        {
          name: 'type',
          value: `${ORG_TYPE_CODE_SYSTEM}|${ORG_TYPE_PAYER_CODE}`,
        },
        {
          name: '_offset',
          value: offset,
        }
      );
      let plans: Organization[] = [];
      let resources = await oystehr!.fhir.search<Organization>({
        resourceType: 'Organization',
        params: searchParams,
      });
      plans = plans.concat(resources.unbundle());
      while (resources.link?.find((link) => link.relation === 'next')) {
        resources = await oystehr!.fhir.search<Organization>({
          resourceType: 'Organization',
          params: searchParams.map((param) => {
            if (param.name === '_offset') {
              return {
                ...param,
                value: (offset += 1000),
              };
            }
            return param;
          }),
        });
        plans = plans.concat(resources.unbundle());
      }

      return plans;
    },
    {
      enabled: (enabled !== undefined ? enabled : true) && !!oystehr,
      cacheTime: 0,
    }
  );
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useInsuranceMutation = (insurancePlan?: Organization) => {
  const { oystehr } = useApiClients();

  return useMutation(['insurances', { oystehr, id: insurancePlan?.id }], async (data: InsuranceData) => {
    const resourceExtensions = insurancePlan?.extension || [];
    const requirementSettingsExistingExtensions = resourceExtensions.find(
      (ext) => ext.url === FHIR_EXTENSION.InsurancePlan.insuranceRequirements.url
    )?.extension;
    const requirementSettingsNewExtensions = requirementSettingsExistingExtensions || [];

    Object.keys(INSURANCE_SETTINGS_MAP).map((setting) => {
      if (data[setting as keyof typeof INSURANCE_SETTINGS_MAP] === undefined) {
        return;
      }
      const currentSettingExt: Extension = {
        url: setting,
        valueBoolean: data[setting as keyof typeof INSURANCE_SETTINGS_MAP],
      };

      const existingExtIndex = requirementSettingsNewExtensions.findIndex((ext) => ext.url === currentSettingExt.url);
      if (existingExtIndex >= 0) {
        requirementSettingsNewExtensions[existingExtIndex] = currentSettingExt;
      } else {
        requirementSettingsNewExtensions.push(currentSettingExt);
      }
    });

    const resource: Organization = {
      resourceType: 'Organization',
      active: data.active ?? true,
      name: data.displayName,
      type: [
        {
          coding: [
            {
              system: ORG_TYPE_CODE_SYSTEM,
              code: ORG_TYPE_PAYER_CODE,
            },
          ],
        },
      ],
    };
    if (!requirementSettingsExistingExtensions) {
      resourceExtensions?.push({
        url: FHIR_EXTENSION.InsurancePlan.insuranceRequirements.url,
        extension: requirementSettingsNewExtensions,
      });
    }
    resource.extension = resourceExtensions;

    if (!oystehr) throw new Error('Oystehr is not defined');
    let prom: Promise<Organization>;
    if (data.id) {
      resource.id = data.id;
      prom = oystehr.fhir.update<Organization>(resource);
    } else {
      prom = oystehr.fhir.create<Organization>(resource);
    }
    const response = await prom;
    return response;
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useInsuranceOrganizationsQuery = () => {
  const { oystehr } = useApiClients();

  return useQuery(
    ['insurance-organizations', { oystehr }],
    async () => {
      const resources = await oystehr!.fhir.search<Organization>({
        resourceType: 'Organization',
        params: [
          {
            name: 'type',
            value: `${ORG_TYPE_CODE_SYSTEM}|${ORG_TYPE_PAYER_CODE}`,
          },
        ],
      });

      return resources.unbundle();
    },
    {
      enabled: !!oystehr,
    }
  );
};
