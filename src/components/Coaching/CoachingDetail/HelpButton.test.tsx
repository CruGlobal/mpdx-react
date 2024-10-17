import { render } from '@testing-library/react';
import { HelpButton } from './HelpButton';

describe('help button', () => {
  it('renders a link to the help article', () => {
    process.env.HELP_URL_COACHING_ACTIVITY = 'https://help.org';

    const { getByRole } = render(
      <HelpButton articleVar="HELP_URL_COACHING_ACTIVITY" />,
    );

    expect(getByRole('link', { name: 'Help' })).toHaveAttribute(
      'href',
      'https://help.org',
    );
  });

  it('renders nothing if the help article does not exist', () => {
    process.env.HELP_URL_COACHING_ACTIVITY = '';

    const { queryByRole } = render(
      <HelpButton articleVar="HELP_URL_COACHING_ACTIVITY" />,
    );

    expect(queryByRole('link', { name: 'Help' })).not.toBeInTheDocument();
  });
});
