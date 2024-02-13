export type DestroyOrganizationAdminResponse = {
  success: boolean;
};

export const DestroyOrganizationAdmin =
  (): DestroyOrganizationAdminResponse => {
    return {
      success: true,
    };
  };
