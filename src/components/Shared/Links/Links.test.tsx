import { render } from '@testing-library/react';
import { PrivacyPolicyLink, TermsOfUseLink } from './Links';

describe('PrivacyPolicyLink', () => {
  it('uses the link from an environment variable', () => {
    process.env.PRIVACY_POLICY_URL = 'privacy-policy.com';

    const { getByRole } = render(<PrivacyPolicyLink />);
    expect(getByRole('link')).toHaveAttribute('href', 'privacy-policy.com');
  });
});

describe('TermsOfUseLink', () => {
  it('uses the link from an environment variable', () => {
    process.env.TERMS_OF_USE_URL = 'terms-of-use.com';

    const { getByRole } = render(<TermsOfUseLink />);
    expect(getByRole('link')).toHaveAttribute('href', 'terms-of-use.com');
  });
});
