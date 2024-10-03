import { ActivityTypeEnum } from 'src/graphql/types.generated';
import { snakeToCamel } from 'src/lib/snakeToCamel';

export interface GoogleIntegrationResponse {
  id: string;
  type: string;
  attributes: Omit<GoogleIntegrationAttributes, 'id'>;
  relationships: Relationships;
}

type Relationships = {
  account_list: object[];
  google_account: object[];
};

interface Calendar {
  id: string;
  name: string;
}

interface GoogleIntegrationAttributes {
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

export interface GoogleIntegrationAttributesCamel {
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

/*
 * Convert a Google Integration object received from the REST API into the format
 * expected by GraphQL.
 */
export const parseGoogleIntegrationResponse = (
  data: GoogleIntegrationResponse,
): GoogleIntegrationAttributesCamel => {
  // Convert keys from snake case to camel case, keeping values the same
  const attributes = Object.fromEntries(
    Object.entries(data.attributes).map(([key, value]) => [
      snakeToCamel(key),
      value,
    ]),
  ) as Omit<GoogleIntegrationAttributesCamel, 'id'>;

  // Convert REST activity type enums which are lowercase to GraphQL activity type enums, which are uppercase
  attributes.calendarIntegrations = data.attributes.calendar_integrations.map(
    (integration) => integration.toUpperCase() as ActivityTypeEnum,
  );

  return {
    id: data.id,
    ...attributes,
  };
};
