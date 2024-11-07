import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { DisplayMethodEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { announcement } from '../Announcements.mock';
import { AnnouncementModal } from './AnnouncementModal';

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
          <AnnouncementModal
            announcement={{
              ...announcement,
              displayMethod: DisplayMethodEnum.Modal,
            }}
            handlePerformAction={handlePerformAction}
          />
        </ThemeProvider>
      </TestRouter>
    </I18nextProvider>
  );
};

describe('AnnouncementModal', () => {
  it('initial', () => {
    const { getByRole, getByText, getAllByRole } = render(<TestComponent />);

    expect(getByText(announcement.title)).toBeInTheDocument();
    expect(getByText(announcement.body as string)).toBeInTheDocument();

    expect(getByRole('button', { name: 'Contacts' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Create Appeal' })).toBeInTheDocument();

    const closeButtons = getAllByRole('button', { name: 'Close' });
    expect(closeButtons).toHaveLength(2);
  });

  it('should handle close', () => {
    const { getAllByRole } = render(<TestComponent />);

    const closeButtons = getAllByRole('button', { name: 'Close' });

    userEvent.click(closeButtons[0]);
    // Check to validate it is called with no arguments
    expect(handlePerformAction).toHaveBeenCalledWith();

    userEvent.click(closeButtons[1]);
    expect(handlePerformAction).toHaveBeenLastCalledWith();
    expect(handlePerformAction).toHaveBeenCalledTimes(2);
  });

  it('should fire handlePerformAction() with the first action', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Contacts' }));

    expect(handlePerformAction).toHaveBeenCalledWith(announcement.actions[0]);
  });

  it('should fire handlePerformAction() with the second action', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Create Appeal' }));

    expect(handlePerformAction).toHaveBeenCalledWith(announcement.actions[1]);
  });
});
