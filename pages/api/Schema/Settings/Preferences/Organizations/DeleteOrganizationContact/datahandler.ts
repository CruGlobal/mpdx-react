export type DeleteOrganizationContactResponse = {
  success: boolean;
};

export const DeleteOrganizationContact =
  (): DeleteOrganizationContactResponse => {
    return {
      success: true,
    };
  };
