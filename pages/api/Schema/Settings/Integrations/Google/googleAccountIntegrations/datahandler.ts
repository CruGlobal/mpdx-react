import { ActivityTypeEnum } from 'pages/api/graphql-rest.page.generated';
import { snakeToCamel } from 'src/lib/snakeToCamel';

export interface GoogleAccountIntegrationsResponse {
  id: string;
  type: string;
  attributes: Omit<GoogleAccountIntegrationAttributes, 'id'>;
  relationships: Relationships;
}
type Relationships = {
  account_list: object[];
  google_account: object[];
};
export interface GoogleAccountIntegrationAttributes {
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
interface GoogleAccountIntegrationAttributesCamel {
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

export const GoogleAccountIntegrations = (
  data: GoogleAccountIntegrationsResponse[],
): GoogleAccountIntegrationAttributesCamel[] => {
  return data.map((integrations) => {
    const attributes = {} as Omit<
      GoogleAccountIntegrationAttributesCamel,
      'id'
    >;
    Object.keys(integrations.attributes).forEach((key) => {
      attributes[snakeToCamel(key)] = integrations.attributes[key];
    });
    // Convert REST activity type enums which are lowercase to GraphQL activity type enums, which are uppercase
    attributes.calendarIntegrations =
      integrations.attributes.calendar_integrations.map(
        (integration) => integration.toUpperCase() as ActivityTypeEnum,
      );
    return { id: integrations.id, ...attributes };
  });
};
