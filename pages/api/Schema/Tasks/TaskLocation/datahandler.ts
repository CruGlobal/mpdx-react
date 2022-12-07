import { TaskLocation } from '../../../graphql-rest.page.generated';

export interface TaskLocationResponse {
  id: string;
  attributes: {
    location: string;
  };
}

export const getLocationForTask = (
  data: TaskLocationResponse,
): TaskLocation => {
  return {
    id: data.id,
    location: data.attributes.location ?? '',
  };
};
