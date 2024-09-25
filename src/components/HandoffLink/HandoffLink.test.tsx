import * as nextRouter from 'next/router';
import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { UserPreferenceContext } from '../User/Preferences/UserPreferenceProvider';
import HandoffLink from '.';

describe('HandoffLink', () => {
  let open: jest.Mock;
  let originalOpen: Window['open'];
  const useRouter = jest.spyOn(nextRouter, 'useRouter');
  const rewriteDomain = process.env.REWRITE_DOMAIN;
  const userId = 'userID123';

  beforeEach(() => {
    open = jest.fn();
    originalOpen = window.open;
    window.open = open;
    (
      useRouter as jest.SpyInstance<
        Pick<nextRouter.NextRouter, 'query' | 'isReady'>
      >
    ).mockImplementation(() => ({
      query: { accountListId: 'accountListId' },
      isReady: true,
    }));
  });

  afterEach(() => {
    window.open = originalOpen;
  });

  it('default', async () => {
    const { getByRole } = render(
      <GqlMockedProvider>
        <UserPreferenceContext.Provider value={{ userId, locale: 'en-US' }}>
          <HandoffLink path="/contacts">
            <a>Link</a>
          </HandoffLink>
        </UserPreferenceContext.Provider>
      </GqlMockedProvider>,
    );
    const linkElement = getByRole('link', { hidden: true, name: 'Link' });
    expect(linkElement).toHaveAttribute(
      'href',
      `https://${rewriteDomain}/contacts`,
    );
    userEvent.click(linkElement);
    expect(open).toHaveBeenCalledWith(
      `${process.env.SITE_URL}/api/handoff?accountListId=accountListId&userId=${userId}&path=%2Fcontacts`,
      '_blank',
    );
  });

  it('onClick defaultPrevented', async () => {
    const handleClick = jest.fn((e) => e.preventDefault());
    const { getByRole } = render(
      <GqlMockedProvider>
        <HandoffLink path="/contacts">
          <a onClick={handleClick}>Link</a>
        </HandoffLink>
      </GqlMockedProvider>,
    );
    const linkElement = getByRole('link', { hidden: true, name: 'Link' });
    expect(linkElement).toHaveAttribute(
      'href',
      `https://${rewriteDomain}/contacts`,
    );
    userEvent.click(linkElement);
    expect(handleClick).toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

  it('enforces single child', async () => {
    expect(() =>
      render(
        <GqlMockedProvider>
          <HandoffLink path="/contacts">
            <a>Link</a>
            <a>Link</a>
          </HandoffLink>
        </GqlMockedProvider>,
      ),
    ).toThrow();
  });

  describe('SITE_URL set', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV, SITE_URL: 'https://next.mpdx.org' };
    });

    afterAll(() => {
      process.env = OLD_ENV;
    });

    it('changes base URL', () => {
      const { getByRole } = render(
        <GqlMockedProvider>
          <HandoffLink path="/contacts">
            <a>Link</a>
          </HandoffLink>
        </GqlMockedProvider>,
      );
      expect(getByRole('link', { hidden: true, name: 'Link' })).toHaveAttribute(
        'href',
        `https://${rewriteDomain}/contacts`,
      );
      expect(getByRole('link', { hidden: true, name: 'Link' })).toHaveAttribute(
        'target',
        `_blank`,
      );
    });
  });
});
