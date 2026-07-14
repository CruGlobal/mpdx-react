import { useEffect, useState } from 'react';
import { IntegrationAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { useOptionalAccountListId } from 'src/hooks/useAccountListId';
import { useRequiredSession } from 'src/hooks/useRequiredSession';

export const useOauthUrl = () => {
  const { apiToken } = useRequiredSession();
  // Optional because the setup Connect flow reuses ConnectOrganization on
  // /setup/connect, which has no accountListId in the route.
  const accountListId = useOptionalAccountListId();

  const [origin, setOrigin] = useState('');
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const getRedirectUrl = (accordion: IntegrationAccordion) =>
    encodeURIComponent(
      accountListId
        ? `${origin}/accountLists/${accountListId}/settings/integrations?selectedTab=${accordion}`
        : `${origin}/setup/connect`,
    );

  return {
    getGoogleOauthUrl: () =>
      `${process.env.OAUTH_URL}/auth/user/google` +
      `?redirect_to=${getRedirectUrl(IntegrationAccordion.Google)}` +
      `&access_token=${apiToken}`,

    getMailChimpOauthUrl: () =>
      `${process.env.OAUTH_URL}/auth/user/mailchimp?account_list_id=${accountListId}` +
      `&redirect_to=${getRedirectUrl(IntegrationAccordion.Mailchimp)}` +
      `&access_token=${apiToken}`,

    getOrganizationOauthUrl: (organizationId: string) =>
      `${process.env.OAUTH_URL}/auth/user/donorhub` +
      `?redirect_to=${getRedirectUrl(IntegrationAccordion.Organization)}` +
      `&access_token=${apiToken}` +
      `&organization_id=${organizationId}`,

    getPrayerlettersOauthUrl: () =>
      `${process.env.OAUTH_URL}/auth/user/prayer_letters?account_list_id=${accountListId}` +
      `&redirect_to=${getRedirectUrl(IntegrationAccordion.Prayerletters)}` +
      `&access_token=${apiToken}`,
  };
};
