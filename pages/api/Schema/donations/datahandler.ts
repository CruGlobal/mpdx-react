import { DesignationWithDisplayName } from '../../graphql-rest.page.generated';

export interface DonationReponseData {
  id: string;
  relationships: {
    designation_account: {
      data: {
        id: string;
      };
    };
  };
}

export interface DonationReponseIncluded {
  id: string;
  attributes: {
    display_name: string;
  };
}

export const getDesignationDisplayNames = (
  data: DonationReponseData[],
  included: DonationReponseIncluded[],
): DesignationWithDisplayName[] => {
  return data.map((donation) => ({
    id: donation.id,
    displayName: included.find(
      (designation) =>
        donation.relationships.designation_account.data.id === designation.id,
    )?.attributes.display_name,
  }));
};
