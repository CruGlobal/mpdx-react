import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { announcement } from '../Announcements.mock';
import { AnnouncementBanner } from './AnnouncementBanner';

const handlePerformAction = jest.fn();
const accountListId = 'accountListId';
const router = {
  query: { accountListId },
  isReady: true,
};

const TestComponent: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <TestRouter router={router}>
        <ThemeProvider theme={theme}>
          <AnnouncementBanner
            announcement={announcement}
            handlePerformAction={handlePerformAction}
          />
        </ThemeProvider>
      </TestRouter>
    </I18nextProvider>
  );
};

describe('AnnouncementBanner', () => {
  it('initial', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    expect(getByText(announcement.title)).toBeInTheDocument();

    expect(getByRole('button', { name: 'Contacts' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Create Appeal' })).toBeInTheDocument();

    expect(
      getByRole('button', { name: 'Hide announcement' }),
    ).toBeInTheDocument();
  });

  it('should fire handlePerformAction() with no action', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Hide announcement' }));

    // Check to validate it is called with no arguments
    expect(handlePerformAction).toHaveBeenCalledWith();
  });

  it('should fire handlePerformAction() with an action', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Contacts' }));

    // Check to validate it is called with no arguments
    expect(handlePerformAction).toHaveBeenCalledWith(announcement.actions[0]);
  });
});
