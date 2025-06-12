import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import { ContactDetailProvider } from '../ContactDetailContext';
import { ContactDetailsHeader } from './ContactDetailsHeader';
import { GetContactDetailsHeaderQuery } from './ContactDetailsHeader.generated';

const accountListId = 'abc';
const contactId = 'contact-1';

const mutationSpy = jest.fn();

interface TestComponentProps {
  duplicateRecord?: 1 | 2;
  pathname?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  duplicateRecord,
  pathname,
}) => (
  <SnackbarProvider>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <TestRouter router={{ query: { accountListId }, pathname }}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<{
            GetContactDetailsHeader: GetContactDetailsHeaderQuery;
          }>
            mocks={{
              GetContactDetailsHeader: {
                contact: {
                  name: 'Lname, Fname',
                  avatar: 'https://cru.org/assets/image.jpg',
                  primaryPerson: null,
                  pledgeCurrency: 'USD',
                  lastDonation: null,
                },
                contactDuplicates: {
                  nodes:
                    typeof duplicateRecord === 'number'
                      ? [
                          {
                            recordOne: {
                              id:
                                duplicateRecord === 1
                                  ? contactId
                                  : 'duplicate-contact',
                            },
                            recordTwo: {
                              id:
                                duplicateRecord === 1
                                  ? 'duplicate-contact'
                                  : contactId,
                            },
                          },
                        ]
                      : [],
                },
              },
            }}
            onCall={mutationSpy}
          >
            <ContactPanelProvider>
              <ContactDetailProvider>
                <ContactDetailsHeader
                  accountListId={accountListId}
                  contactId={contactId}
                  setContactDetailsLoaded={() => {}}
                  contactDetailsLoaded={false}
                />
              </ContactDetailProvider>
            </ContactPanelProvider>
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>
    </LocalizationProvider>
  </SnackbarProvider>
);

describe('ContactDetails', () => {
  it('should show loading state', async () => {
    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId('Skeleton')).toBeInTheDocument();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('GetContactDetailsHeader', {
        accountListId,
        contactId,
        loadDuplicate: true,
      }),
    );
  });

  describe('duplicate contact', () => {
    it.each([[1], [2]] as const)(
      'should render duplicate contact when the current contact is record %i',
      async (duplicateRecord) => {
        const { findByRole, getByRole } = render(
          <TestComponent duplicateRecord={duplicateRecord} />,
        );

        const matchButton = await findByRole('link', { name: 'See Match' });
        expect(matchButton).toHaveAttribute(
          'href',
          '/accountLists/abc/tools/merge/contacts?duplicateId=duplicate-contact',
        );

        userEvent.click(getByRole('button', { name: 'Dismiss Duplicate' }));
        expect(matchButton).not.toBeInTheDocument();
      },
    );

    it('does not render duplicate contact where there is no duplicate', async () => {
      const { queryByRole } = render(<TestComponent />);

      expect(
        queryByRole('link', { name: 'See Match' }),
      ).not.toBeInTheDocument();
    });

    it('does not load on the merge contacts page', async () => {
      render(
        <TestComponent pathname="/accountLists/[accountListId]/tools/merge/contacts/[[...contactId]]" />,
      );

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('GetContactDetailsHeader', {
          loadDuplicate: false,
        }),
      );
    });
  });

  it('should render with contact details', async () => {
    const { findByText, queryByTestId } = render(<TestComponent />);

    expect(await findByText('Lname, Fname')).toBeVisible();

    expect(queryByTestId('Skeleton')).not.toBeInTheDocument();
  });

  it('should open Edit Partnership modal', async () => {
    const { queryByText, getAllByLabelText } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <TestComponent />
      </LocalizationProvider>,
    );
    await waitFor(() =>
      expect(getAllByLabelText('Edit Partnership Info')[0]).toBeInTheDocument(),
    );
    userEvent.click(getAllByLabelText('Edit Partnership Info')[0]);
    await waitFor(() =>
      expect(queryByText('Edit Partnership')).toBeInTheDocument(),
    );
  });

  it('should close Edit Partnership modal', async () => {
    const { queryByText, getAllByLabelText, getByLabelText } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <TestComponent />
      </LocalizationProvider>,
    );

    await waitFor(() =>
      expect(getAllByLabelText('Edit Partnership Info')[0]).toBeInTheDocument(),
    );
    userEvent.click(getAllByLabelText('Edit Partnership Info')[0]);
    await waitFor(() =>
      expect(queryByText('Edit Partnership')).toBeInTheDocument(),
    );
    userEvent.click(getByLabelText('Close'));
    await waitFor(() =>
      expect(queryByText('Edit Partnership')).not.toBeInTheDocument(),
    );
  });

  it('should render avatar', async () => {
    const { queryByText, getAllByLabelText } = render(<TestComponent />);

    await waitFor(() =>
      expect(getAllByLabelText('Edit Partnership Info')[0]).toBeInTheDocument(),
    );
    userEvent.click(getAllByLabelText('Edit Partnership Info')[0]);
    await waitFor(() =>
      expect(queryByText('Edit Partnership Info')).toBeInTheDocument(),
    );

    const avatarImage = document.querySelector('img') as HTMLImageElement;
    expect(avatarImage.src).toEqual('https://cru.org/assets/image.jpg');
    expect(avatarImage.alt).toEqual('Lname, Fname');
  });
});
