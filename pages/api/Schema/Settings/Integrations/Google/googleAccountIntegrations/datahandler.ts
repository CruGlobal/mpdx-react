import {
  GoogleIntegrationAttributesCamel,
  GoogleIntegrationResponse,
  parseGoogleIntegrationResponse,
} from '../parse';

export const GoogleAccountIntegrations = (
  data: GoogleIntegrationResponse[],
): GoogleIntegrationAttributesCamel[] =>
  data.map((integration) => parseGoogleIntegrationResponse(integration));
