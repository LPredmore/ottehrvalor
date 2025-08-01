import { useQuery } from 'react-query';
import { OystehrAPIClient } from 'ui-components';
import { PromiseReturnType } from 'utils';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useGetPatients = (
  apiClient: OystehrAPIClient | null,
  onSuccess: (data: PromiseReturnType<ReturnType<OystehrAPIClient['getPatients']>>) => void
) => {
  return useQuery(
    ['patients'],
    () => {
      if (apiClient) {
        return apiClient.getPatients();
      }
      throw new Error('api client not defined');
    },
    {
      enabled: false,
      onSuccess,
      onError: (err) => {
        console.error('Error during fetching get patients: ', err);
      },
    }
  );
};
