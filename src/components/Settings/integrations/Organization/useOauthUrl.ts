import { useAccountListId } from 'src/hooks/useAccountListId';
import { useApiToken } from 'src/hooks/useApiToken';

export const useOauthUrl = () => {
  const route = 'preferences/integrations?selectedTab=organization';
  const apiToken = useApiToken();
  const redirectUrl = encodeURIComponent(`${window.location.origin}/${route}`);
  const accountListId = useAccountListId();

  return {
    getOauthUrl: (organizationId: string) =>
      `${process.env.OAUTH_URL}/auth/user/donorhub?account_list_id=${accountListId}` +
      `&redirect_to=${redirectUrl}` +
      `&access_token=${apiToken}` +
      `&organization_id=${organizationId}`,
  };
};
