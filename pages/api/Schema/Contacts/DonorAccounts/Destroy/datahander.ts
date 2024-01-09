import { ContactDestroyDonorAccountPayload } from '../../../../graphql-rest.page.generated';

export interface DestroyDonorAccountResponse {
  id: string;
}

export const DestroyDonorAccount = (
  data: DestroyDonorAccountResponse,
): ContactDestroyDonorAccountPayload => ({
  id: data?.id,
});
