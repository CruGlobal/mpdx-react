export interface OrganizationsResponse {
  data: Organizations[];
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

export interface Organizations {
  id: string;
  type: string;
  attributes: {
    name: string;
  };
}

interface OrganizationsReturnedResponse {
  organizations: OrganizationsCamelCase[];
  pagination: {
    page: number;
    perPage: number;
    totalCount: number;
    totalPages: number;
  };
}

interface OrganizationsCamelCase {
  id: string;
  name: string;
  type: string;
}

export const Organizations = (
  data: OrganizationsResponse,
): OrganizationsReturnedResponse => {
  const organizations = data.data.map((organization) => ({
    id: organization.id,
    name: organization.attributes.name,
    type: organization.type,
  }));

  const {
    page = 0,
    per_page = 0,
    total_count = 0,
    total_pages = 0,
  } = data.meta.pagination;

  return {
    organizations,
    pagination: {
      page,
      perPage: per_page,
      totalCount: total_count,
      totalPages: total_pages,
    },
  };
};
