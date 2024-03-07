import { CanUserExportData } from 'pages/api/graphql-rest.page.generated';

const canUserExportData = (data: {
  allowed: boolean;
  exported_at: string | null;
}): CanUserExportData => {
  const { allowed, exported_at } = data;

  return {
    allowed: allowed,
    exportedAt: exported_at,
  };
};

export { canUserExportData };
