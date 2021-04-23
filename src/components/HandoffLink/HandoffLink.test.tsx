import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestWrapper from '../../../__tests__/util/TestWrapper';
import { User } from '../../../graphql/types.generated';
import HandoffLink from '.';

describe('HandoffLink', () => {
  let open: jest.Mock;
  let originalOpen: Window['open'];

  beforeEach(() => {
    open = jest.fn();
    originalOpen = window.open;
    window.open = open;
  });

  afterEach(() => {
    window.open = originalOpen;
  });

  it('default', async () => {
    const { getByRole } = render(
      <TestWrapper
        initialState={{
          accountListId: 'accountListId',
          user: { id: 'userId', firstName: 'Bob', lastName: 'Jones' } as User,
        }}
      >
        <HandoffLink path="/contacts">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>Link</a>
        </HandoffLink>
      </TestWrapper>,
    );
    const linkElement = getByRole('link', { name: 'Link' });
    expect(linkElement).toHaveAttribute(
      'href',
      'https://stage.mpdx.org/contacts',
    );
    userEvent.click(linkElement);
    expect(open).toHaveBeenCalledWith(
      'http://localhost/api/handoff?accountListId=accountListId&userId=userId&path=%2Fcontacts',
      '_blank',
    );
  });

  it('default auth', async () => {
    const { getByRole } = render(
      <HandoffLink path="/contacts" auth>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a>Link</a>
      </HandoffLink>,
    );
    const linkElement = getByRole('link', { name: 'Link' });
    expect(linkElement).toHaveAttribute(
      'href',
      'https://auth.stage.mpdx.org/contacts',
    );
    userEvent.click(linkElement);
    expect(open).toHaveBeenCalledWith(
      'http://localhost/api/handoff?auth=true&path=%2Fcontacts',
      '_blank',
    );
  });

  it('onClick defaultPrevented', async () => {
    const handleClick = jest.fn((e) => e.preventDefault());
    const { getByRole } = render(
      <HandoffLink path="/contacts">
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <a onClick={handleClick}>Link</a>
      </HandoffLink>,
    );
    const linkElement = getByRole('link', { name: 'Link' });
    expect(linkElement).toHaveAttribute(
      'href',
      'https://stage.mpdx.org/contacts',
    );
    userEvent.click(linkElement);
    expect(handleClick).toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

  it('enforces single child', async () => {
    expect(() =>
      render(
        <HandoffLink path="/contacts">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>Link</a>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>Link</a>
        </HandoffLink>,
      ),
    ).toThrowError();
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
        <HandoffLink path="/contacts">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>Link</a>
        </HandoffLink>,
      );
      expect(getByRole('link', { name: 'Link' })).toHaveAttribute(
        'href',
        'https://mpdx.org/contacts',
      );
    });

    it('default auth', async () => {
      const { getByRole } = render(
        <HandoffLink path="/contacts" auth>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>Link</a>
        </HandoffLink>,
      );
      expect(getByRole('link', { name: 'Link' })).toHaveAttribute(
        'href',
        'https://auth.mpdx.org/contacts',
      );
    });
  });
});
