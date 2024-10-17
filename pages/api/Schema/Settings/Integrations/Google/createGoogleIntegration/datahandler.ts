import {
  GoogleIntegrationAttributesCamel,
  GoogleIntegrationResponse,
  parseGoogleIntegrationResponse,
} from '../parse';

export const CreateGoogleIntegration = (
  data: GoogleIntegrationResponse,
): GoogleIntegrationAttributesCamel => parseGoogleIntegrationResponse(data);
