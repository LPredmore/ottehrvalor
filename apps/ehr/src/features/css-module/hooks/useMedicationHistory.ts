import { QueryObserverResult } from 'react-query';
import { ChartDataFieldsKeys, GetChartDataResponse, MedicationDTO, removePrefix, SearchParams } from 'utils';
import { getSelectors } from '../../../shared/store/getSelectors';
import { useAppointmentStore } from '../../../telemed';
import { useChartData } from './useChartData';

export type MedicationHistoryField = Extract<ChartDataFieldsKeys, 'medications' | 'inhouseMedications'>;

export const MEDICATION_HISTORY_FIELDS: MedicationHistoryField[] = ['medications', 'inhouseMedications'];
export const PATIENT_MEDS_COUNT_TO_LOAD = 100;
export const COLLAPSED_MEDS_COUNT = 3;

const SEARCH_PARAMS: Record<MedicationHistoryField, SearchParams> = {
  medications: {
    _sort: '-effective',
    _include: 'MedicationStatement:source',
    _tag: 'current-medication',
  },
  inhouseMedications: {
    _sort: '-effective',
    _include: 'MedicationStatement:source',
    _tag: 'in-house-medication',
  },
};

export interface MedicationWithTypeDTO extends MedicationDTO {
  chartDataField: MedicationHistoryField;
}

export const useMedicationHistory = ({
  search_by = 'patient',
  count = PATIENT_MEDS_COUNT_TO_LOAD,
  chartDataFields = MEDICATION_HISTORY_FIELDS,
}: {
  search_by?: SearchParams['_search_by'];
  count?: number;
  chartDataFields?: MedicationHistoryField[];
} = {}): {
  isLoading: boolean;
  medicationHistory: MedicationWithTypeDTO[];
  refetchHistory: () => Promise<QueryObserverResult<GetChartDataResponse, unknown>>;
} => {
  const { encounter } = getSelectors(useAppointmentStore, ['encounter']);

  const requestedFields = chartDataFields.reduce(
    (acc, field) => {
      acc[field] = {
        ...SEARCH_PARAMS[field],
        _search_by: search_by,
        _count: count,
      };
      return acc;
    },
    {} as Record<MedicationHistoryField, SearchParams>
  );

  const {
    isLoading,
    chartData: historyData,
    refetch: refetchHistory,
  } = useChartData({
    encounterId: encounter.id || '',
    requestedFields,
    enabled: !!encounter.id,
  });

  /**
   * Enrich medication records with practitioner details.
   * _include=MedicationStatement:source fetches related Practitioner resources.
   * Replace practitioner references with full objects for display.
   * todo: consider to move this logic to the backend
   */
  if (historyData?.practitioners?.length) {
    chartDataFields.forEach((field) => {
      historyData[field]?.forEach((val) => {
        if (
          'practitioner' in val &&
          val.practitioner &&
          'reference' in val.practitioner &&
          val.practitioner.reference
        ) {
          const ref = removePrefix('Practitioner/', val.practitioner.reference);
          const practitioner = historyData.practitioners?.find((practitioner) => practitioner.id === ref);
          val.practitioner = practitioner;
        }
      });
    });
  }

  const combinedMedicationHistory: MedicationWithTypeDTO[] = chartDataFields
    .flatMap((field) => {
      const fieldData = historyData?.[field] || [];
      return fieldData.map((medication: MedicationDTO) => ({
        ...medication,
        chartDataField: field,
      }));
    })
    .sort((a, b) => {
      const FALLBACK_DATE = 0; // move elements without date to the end of the list
      const dateA = a?.intakeInfo.date ? new Date(a.intakeInfo.date) : FALLBACK_DATE;
      const dateB = b?.intakeInfo.date ? new Date(b.intakeInfo.date) : FALLBACK_DATE;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  return {
    isLoading,
    medicationHistory: combinedMedicationHistory,
    refetchHistory,
  };
};
