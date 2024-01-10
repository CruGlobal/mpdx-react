//import { GetUserInCruOrg } from '../../../../graphql-rest.page.generated';

import { GetUserInCruOrg } from 'pages/api/graphql-rest.page.generated';

const getUserInCruOrg = (data: {
  allowed: boolean;
  exported_at: string | null;
}): GetUserInCruOrg => {
  const { allowed, exported_at } = data;

  return {
    allowed: allowed,
    exportedAt: exported_at,
  };
};

export { getUserInCruOrg };
