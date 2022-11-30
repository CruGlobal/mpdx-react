import { DesignationWithDisplayName } from '../../graphql-rest.page.generated';

export interface DonationReponse {
  id: string;
  relationships: {
    designation_account: {
      data: {
        id: string;
        display_name: string;
      };
    };
  };
}

export const getDesignationDisplayNames = (
  data: DonationReponse,
): DesignationWithDisplayName => {
  return {
    id: data.id,
    displayName: data.relationships.designation_account.data.display_name,
  };
};
