import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { AppealContactsQuery } from '../AddContactToAppealModal/AppealContacts.generated';
import { AddExcludedContactModal } from './AddExcludedContactModal';

const accountListId = 'abc';
const appealId = 'appealId';
const contactId = 'contact-3';
const bulkContactIds = [contactId, 'contact-4', 'contact-5'];
const router = {
  query: { accountListId },
  isReady: true,
};
const handleClose = jest.fn();
const mutationSpy = jest.fn();

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const appealMock: AppealContactsQuery = {
  appeal: {
    id: appealId,
    contactIds: ['contact-1', 'contact-2'],
  },
};

const Components = ({
  contactIds = [contactId],
}: {
  contactIds?: string[];
}) => (
  <I18nextProvider i18n={i18n}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider<{
              AppealContacts: AppealContactsQuery;
            }>
              mocks={{
                AppealContacts: appealMock,
              }}
              onCall={mutationSpy}
            >
              <AppealsWrapper>
                <AppealsContext.Provider
                  value={
                    {
                      accountListId,
                      appealId: appealId,
                    } as unknown as AppealsType
                  }
                >
                  <AddExcludedContactModal
                    handleClose={handleClose}
                    contactIds={contactIds}
                  />
                </AppealsContext.Provider>
              </AppealsWrapper>
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>
    </LocalizationProvider>
  </I18nextProvider>
);

describe('AddExcludedContactModal', () => {
  it('default', () => {
    const { getByRole, getByText } = render(<Components />);

    expect(getByRole('heading', { name: 'Add Contact' })).toBeInTheDocument();
    expect(
      getByText(
        'You will not be able to exclude this contact once you add them to this appeal. Instead, you will be able to remove them from it. Are you sure?',
      ),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: 'No' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Yes' })).toBeInTheDocument();
  });

  it('bulk default', () => {
    const { getByRole, getByText } = render(
      <Components contactIds={bulkContactIds} />,
    );

    expect(getByRole('heading', { name: 'Add Contacts' })).toBeInTheDocument();
    expect(
      getByText(
        'You will not be able to exclude these 3 contacts once you add them to this appeal. Instead, you will be able to remove them from it. Are you sure?',
      ),
    ).toBeInTheDocument();
  });

  it('should close modal', async () => {
    const { getByRole } = render(<Components />);

    expect(handleClose).toHaveBeenCalledTimes(0);
    await waitFor(() =>
      expect(getByRole('button', { name: 'No' })).not.toBeDisabled(),
    );
    userEvent.click(getByRole('button', { name: 'No' }));
    expect(handleClose).toHaveBeenCalledTimes(1);

    userEvent.click(getByRole('button', { name: 'Close' }));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('should send mutation and remove the contact from the excluded list', async () => {
    const { getByRole } = render(<Components />);

    expect(mutationSpy).toHaveBeenCalledTimes(0);

    await waitFor(() =>
      expect(getByRole('button', { name: 'Yes' })).not.toBeDisabled(),
    );
    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('AssignContactsToAppeal', {
        input: {
          accountListId,
          attributes: {
            id: appealId,
            contactIds: ['contact-1', 'contact-2', contactId],
            forceListDeletion: true,
          },
        },
      });
    });

    expect(mockEnqueue).toHaveBeenCalledWith(
      'Successfully added contact to appeal',
      {
        variant: 'success',
      },
    );
  });

  it('sends all contactIds in bulk mutation', async () => {
    const { getByRole } = render(<Components contactIds={bulkContactIds} />);

    expect(mutationSpy).toHaveBeenCalledTimes(0);

    await waitFor(() =>
      expect(getByRole('button', { name: 'Yes' })).not.toBeDisabled(),
    );
    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('AssignContactsToAppeal', {
        input: {
          accountListId,
          attributes: {
            id: appealId,
            contactIds: ['contact-1', 'contact-2', ...bulkContactIds],
            forceListDeletion: true,
          },
        },
      });
    });

    expect(mockEnqueue).toHaveBeenCalledWith(
      'Successfully added contacts to appeal',
      {
        variant: 'success',
      },
    );
  });
});
