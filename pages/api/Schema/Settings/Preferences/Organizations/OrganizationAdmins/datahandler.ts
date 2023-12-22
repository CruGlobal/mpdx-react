export interface OrganizationAdminsResponse {
  data: Admin[];
  meta: {
    filter: object;
    sort: string;
    pagination: {
      page: number;
      per_page: number;
      total_count: number;
      total_pages: number;
    };
  };
}

export interface Admin {
  id: string;
  type: string;
  attributes: {
    first_name: string;
    created_at: string;
    last_name: string;
    updated_at: string;
    updated_in_db_at: string;
  };
}

interface AdminCamelCase {
  id: string;
  firstName: string;
  lastName: string;
}

export const OrganizationAdmins = (
  data: OrganizationAdminsResponse,
): AdminCamelCase[] => {
  return data.data.map(
    (admin) =>
      ({
        id: admin.id,
        firstName: admin.attributes.first_name,
        lastName: admin.attributes.last_name,
      } as AdminCamelCase),
  );
};
