import React from 'react';
import { render } from '@testing-library/react';
import { OauthLink } from './OauthLink';

describe('OauthLink', () => {
  const oauthDomain = 'https://auth.example.com';

  beforeEach(() => {
    process.env.OAUTH_URL = oauthDomain;
  });

  it('default', async () => {
    const { getByRole } = render(
      <OauthLink path="/contacts">
        <a>Link</a>
      </OauthLink>,
    );
    expect(getByRole('link', { name: 'Link' })).toHaveAttribute(
      'href',
      `${oauthDomain}/contacts?access_token=apiToken`,
    );
  });

  it('enforces single child', async () => {
    expect(() =>
      render(
        <OauthLink path="/contacts">
          <a>Link</a>
          <a>Link</a>
        </OauthLink>,
      ),
    ).toThrow();
  });
});
