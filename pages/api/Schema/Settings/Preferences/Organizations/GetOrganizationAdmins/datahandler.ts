export interface GetOrganizationAdminsResponse {
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

export const GetOrganizationAdmins = (
  data: GetOrganizationAdminsResponse,
): AdminCamelCase[] => {
  return data.data.reduce((prev: AdminCamelCase[], current) => {
    const admin = {
      id: current.id,
      firstName: current.attributes.first_name,
      lastName: current.attributes.last_name,
    } as AdminCamelCase;

    return prev.concat([admin]);
  }, []);
};
