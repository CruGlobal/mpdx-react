export interface GetOrganizationsResponse {
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

interface GetOrganizationsReturnedResponse {
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

export const GetOrganizations = (
  data: GetOrganizationsResponse,
): GetOrganizationsReturnedResponse => {
  const organizations = data.data.reduce(
    (prev: OrganizationsCamelCase[], current) => {
      const org = {} as OrganizationsCamelCase;
      org.id = current.id;
      org.name = current.attributes.name;
      org.type = current.type;

      return prev.concat([org]);
    },
    [],
  );

  const {
    page,
    per_page: perPage,
    total_count: totalCount,
    total_pages: totalPages,
  } = data.meta.pagination;

  return {
    organizations,
    pagination: {
      page,
      perPage,
      totalCount,
      totalPages,
    },
  };
};
