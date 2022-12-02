import { TaskLocationUpdateMutationPayload } from '../../../../graphql-rest.page.generated';

export interface UpdateTaskLocationResponse {
  id: string;
}

export const UpdateTaskLocation = (
  data: UpdateTaskLocationResponse,
): TaskLocationUpdateMutationPayload => ({
  id: data?.id,
});
