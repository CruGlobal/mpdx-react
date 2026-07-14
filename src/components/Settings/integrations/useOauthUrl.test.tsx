import React, { PropsWithChildren } from 'react';
import { renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import TestRouter from '__tests__/util/TestRouter';
import { IntegrationAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { useOauthUrl } from './useOauthUrl';

const accountListId = 'account-list-1';
const apiToken = 'apiToken';

const Wrapper = ({ children }: PropsWithChildren) => (
  <TestRouter router={{ query: { accountListId } }}>{children}</TestRouter>
);

const renderUseOauthUrl = () =>
  renderHook(() => useOauthUrl(), { wrapper: Wrapper });

beforeEach(() => {
  process.env.OAUTH_URL = 'https://auth.mpdx.org';
});

describe('useOauthUrl', () => {
  it('builds the Google OAuth url with the redirect back to integrations', () => {
    const { result } = renderUseOauthUrl();

    expect(result.current.getGoogleOauthUrl()).toBe(
      `https://auth.mpdx.org/auth/user/google?redirect_to=${encodeURIComponent(
        `http://localhost/accountLists/${accountListId}/settings/integrations?selectedTab=${IntegrationAccordion.Google}`,
      )}&access_token=${apiToken}`,
    );
  });

  it('builds the Mailchimp OAuth url with the account list id and redirect', () => {
    const { result } = renderUseOauthUrl();

    expect(result.current.getMailChimpOauthUrl()).toBe(
      `https://auth.mpdx.org/auth/user/mailchimp?account_list_id=${accountListId}&redirect_to=${encodeURIComponent(
        `http://localhost/accountLists/${accountListId}/settings/integrations?selectedTab=${IntegrationAccordion.Mailchimp}`,
      )}&access_token=${apiToken}`,
    );
  });

  it('builds the organization OAuth url with the the organization, account list id, and redirect', () => {
    const { result } = renderUseOauthUrl();

    expect(result.current.getOrganizationOauthUrl('org-1')).toBe(
      `https://auth.mpdx.org/auth/user/donorhub?redirect_to=${encodeURIComponent(
        `http://localhost/accountLists/${accountListId}/settings/integrations?selectedTab=${IntegrationAccordion.Organization}`,
      )}&access_token=${apiToken}&organization_id=org-1`,
    );
  });

  it('builds the Prayer Letters OAuth url with the account list id and redirect', () => {
    const { result } = renderUseOauthUrl();

    expect(result.current.getPrayerlettersOauthUrl()).toBe(
      `https://auth.mpdx.org/auth/user/prayer_letters?account_list_id=${accountListId}&redirect_to=${encodeURIComponent(
        `http://localhost/accountLists/${accountListId}/settings/integrations?selectedTab=${IntegrationAccordion.Prayerletters}`,
      )}&access_token=${apiToken}`,
    );
  });

  it('redirects to the setup Connect page without an accountListId', () => {
    const NoAccountListWrapper = ({ children }: PropsWithChildren) => (
      <TestRouter router={{ query: {}, isReady: true }}>{children}</TestRouter>
    );

    const { result } = renderHook(() => useOauthUrl(), {
      wrapper: NoAccountListWrapper,
    });

    expect(result.current.getOrganizationOauthUrl('org-1')).toBe(
      `https://auth.mpdx.org/auth/user/donorhub?redirect_to=${encodeURIComponent(
        'http://localhost/setup/connect',
      )}&access_token=${apiToken}&organization_id=org-1`,
    );
  });

  it('renders on the server when window is undefined', () => {
    const Probe = () => {
      const { getGoogleOauthUrl } = useOauthUrl();
      return <a href={getGoogleOauthUrl()}>{'link'}</a>;
    };

    const originalWindow = global.window;
    // @ts-expect-error simulating a server environment with no window
    delete global.window;

    try {
      let html = '';
      expect(() => {
        html = renderToString(
          <Wrapper>
            <Probe />
          </Wrapper>,
        );
      }).not.toThrow();

      expect(html).toContain(
        `redirect_to=${encodeURIComponent(
          `/accountLists/${accountListId}/settings/integrations?selectedTab=${IntegrationAccordion.Google}`,
        )}`,
      );
    } finally {
      global.window = originalWindow;
    }
  });
});
