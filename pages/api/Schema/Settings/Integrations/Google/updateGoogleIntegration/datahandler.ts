import { ActivityTypeEnum } from 'src/graphql/types.generated';
import { snakeToCamel } from 'src/lib/snakeToCamel';

export interface UpdateGoogleIntegrationResponse {
  id: string;
  type: string;
  attributes: Omit<SaveGoogleIntegrationAttributes, 'id'>;
  relationships: Relationships;
}

type Relationships = {
  account_list: object[];
  google_account: object[];
};

export interface SaveGoogleIntegrationAttributes {
  calendar_id: string;
  calendar_integration: boolean;
  calendar_integrations: string[];
  calendar_name: string;
  calendars: Calendar[];
  created_at: string;
  updated_at: string;
  id: string;
  updated_in_db_at: string;
}

interface GetGoogleAccountIntegrationAttributesCamel {
  calendarId: string;
  calendarIntegration: boolean;
  calendarIntegrations: ActivityTypeEnum[];
  calendarName: string;
  calendars: Calendar[];
  createdAt: string;
  updatedAt: string;
  id: string;
  updatedInDbAt: string;
}
type Calendar = {
  id: string;
  name: string;
};

export const UpdateGoogleIntegration = (
  data: UpdateGoogleIntegrationResponse,
): GetGoogleAccountIntegrationAttributesCamel => {
  const attributes = {} as Omit<
    GetGoogleAccountIntegrationAttributesCamel,
    'id'
  >;
  Object.keys(data.attributes).forEach((key) => {
    attributes[snakeToCamel(key)] = data.attributes[key];
  });
  // Convert REST activity type enums which are lowercase to GraphQL activity type enums, which are uppercase
  attributes.calendarIntegrations = data.attributes.calendar_integrations.map(
    (integration) => integration.toUpperCase() as ActivityTypeEnum,
  );

  return {
    id: data.id,
    ...attributes,
  };
};
