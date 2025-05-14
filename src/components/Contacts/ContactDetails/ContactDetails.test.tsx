import React, { useContext, useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import theme from '../../../theme';
import {
  ContactDetailContext,
  ContactDetailProvider,
} from './ContactDetailContext';
import { ContactDetails } from './ContactDetails';

const accountListId = 'account-list-1';
const contactId = 'contact-1';

const createRouter = (
  overrides: Partial<Record<string, string | string[]>> = {},
) => {
  return {
    pathname: '/contacts',
    query: {
      accountListId,
      contactId: [contactId],
      ...overrides,
    },
    replace: jest.fn(),
    isReady: true,
  };
};

const renderWithProviders = (
  router: ReturnType<typeof createRouter>,
  Component: React.FC,
) =>
  render(
    <SnackbarProvider>
      <TestRouter router={router}>
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <ContactsWrapper>
              <ContactDetailProvider>
                <Component />
              </ContactDetailProvider>
            </ContactsWrapper>
          </ThemeProvider>
        </GqlMockedProvider>
      </TestRouter>
    </SnackbarProvider>,
  );

describe('ContactDetails', () => {
  it('should change the tab', async () => {
    const router = createRouter();

    const { getAllByRole } = renderWithProviders(router, () => (
      <ContactDetails onClose={() => {}} />
    ));

    const tasksPanel = getAllByRole('tabpanel')[0];
    expect(tasksPanel).toBeVisible();

    userEvent.click(getAllByRole('tab')[1]);
    expect(tasksPanel).not.toBeVisible();
  });

  it('should open the person modal when personId is present in query', async () => {
    const router = createRouter({ personId: 'person-123' });

    const TestComponent = () => {
      const context = useContext(ContactDetailContext);
      return <div data-testid="modal-open">{context?.editPersonModalOpen}</div>;
    };

    const { getByTestId } = renderWithProviders(router, TestComponent);

    await waitFor(() => {
      expect(getByTestId('modal-open').textContent).toBe('person-123');
    });
  });

  it('should close the person modal when personId is removed from query', async () => {
    const Wrapper: React.FC = () => {
      const [showPersonId, setShowPersonId] = useState(true);
      const updatedRouter = createRouter(
        showPersonId ? { personId: 'person-123' } : {},
      );

      const TestComponent = () => {
        const context = useContext(ContactDetailContext);
        return (
          <div data-testid="modal-open">
            {context?.editPersonModalOpen || ''}
          </div>
        );
      };

      useEffect(() => {
        // simulate route query change after mount
        setTimeout(() => {
          act(() => {
            setShowPersonId(false);
          });
        }, 0);
      }, []);

      return (
        <TestRouter router={updatedRouter}>
          <GqlMockedProvider>
            <ThemeProvider theme={theme}>
              <ContactsWrapper>
                <ContactDetailProvider>
                  <TestComponent />
                </ContactDetailProvider>
              </ContactsWrapper>
            </ThemeProvider>
          </GqlMockedProvider>
        </TestRouter>
      );
    };

    const { getByTestId } = render(
      <SnackbarProvider>
        <Wrapper />
      </SnackbarProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('modal-open').textContent).toBe('');
    });
  });

  it('should call router.replace and clear modal when closePersonModal is called', async () => {
    const router = createRouter({ personId: 'person-123' });

    const TestComponent = () => {
      const context = useContext(ContactDetailContext);

      useEffect(() => {
        context?.closePersonModal();
      }, [context]);

      return (
        <div data-testid="modal-open">{context?.editPersonModalOpen || ''}</div>
      );
    };

    const { getByTestId } = renderWithProviders(router, TestComponent);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith(
        {
          pathname: '/contacts',
          query: { accountListId, contactId: [contactId] },
        },
        undefined,
        { shallow: true },
      );
      expect(getByTestId('modal-open').textContent).toBe('');
    });
  });
});
