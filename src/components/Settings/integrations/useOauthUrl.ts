import { IntegrationAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useRequiredSession } from 'src/hooks/useRequiredSession';

export const useOauthUrl = () => {
  const { apiToken } = useRequiredSession();
  const accountListId = useAccountListId();

  const getRedirectUrl = (accordion: IntegrationAccordion) => {
    const domain = process.env.SITE_URL || window.location.origin;
    return encodeURIComponent(
      `${domain}/accountLists/${accountListId}/settings/integrations?selectedTab=${accordion}`,
    );
  };

  return {
    getGoogleOauthUrl: () =>
      `${process.env.OAUTH_URL}/auth/user/google?account_list_id=${accountListId}` +
      `&redirect_to=${getRedirectUrl(IntegrationAccordion.Google)}` +
      `&access_token=${apiToken}`,

    getMailChimpOauthUrl: () =>
      `${process.env.OAUTH_URL}/auth/user/mailchimp?account_list_id=${accountListId}` +
      `&redirect_to=${getRedirectUrl(IntegrationAccordion.Mailchimp)}` +
      `&access_token=${apiToken}`,

    getOrganizationOauthUrl: (organizationId: string) =>
      `${process.env.OAUTH_URL}/auth/user/donorhub?account_list_id=${accountListId}` +
      `&redirect_to=${getRedirectUrl(IntegrationAccordion.Organization)}` +
      `&access_token=${apiToken}` +
      `&organization_id=${organizationId}`,

    getPrayerlettersOauthUrl: () =>
      `${process.env.OAUTH_URL}/auth/user/prayer_letters?account_list_id=${accountListId}` +
      `&redirect_to=${getRedirectUrl(IntegrationAccordion.Prayerletters)}` +
      `&access_token=${apiToken}`,
  };
};
