import {
  GoogleIntegrationAttributesCamel,
  GoogleIntegrationResponse,
  parseGoogleIntegrationResponse,
} from '../parse';

export const UpdateGoogleIntegration = (
  data: GoogleIntegrationResponse,
): GoogleIntegrationAttributesCamel => parseGoogleIntegrationResponse(data);
