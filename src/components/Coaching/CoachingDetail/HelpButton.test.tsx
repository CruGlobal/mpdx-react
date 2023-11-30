import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showArticle } from 'src/lib/helpScout';
import { HelpButton } from './HelpButton';

jest.mock('src/lib/helpScout');

describe('help button', () => {
  it('opens the HelpScout article', () => {
    const { getByRole } = render(
      <HelpButton articleVar="HS_COACHING_ACTIVITY" />,
    );

    userEvent.click(getByRole('button', { name: 'Help' }));
    expect(showArticle).toHaveBeenCalled();
  });
});
