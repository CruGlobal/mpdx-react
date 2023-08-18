export interface GetGoogleAccountIntegrationsResponse {
  id: string;
  type: string;
  attributes: Omit<GetGoogleAccountIntegrationAttributes, 'id'>;
  relationships: relationships;
}

export interface GetGoogleAccountIntegrationAttributes {
  calendar_id: string;
  calendar_integration: boolean;
  calendar_integrations: string[];
  calendar_name: string;
  calendars: calendars[];
  created_at: string;
  updated_at: string;
  id: string;
  updated_in_db_at: string;
}
type calendars = {
  id: string;
  name: string;
};

type relationships = {
  account_list: object[];
  google_account: object[];
};

export const GetGoogleAccountIntegrations = (
  data: GetGoogleAccountIntegrationsResponse[],
): GetGoogleAccountIntegrationAttributes[] => {
  return data.reduce(
    (prev: GetGoogleAccountIntegrationAttributes[], current) => {
      return prev.concat([{ id: current.id, ...current.attributes }]);
    },
    [],
  );
};
