import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  ContactDonorAccountConnection,
  ContactSourceEnum,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { ContactSourceQuery } from './ContactSource.generated';
import { DeleteContactModal, createEmailLink } from './DeleteContactModal';

const contactId = 'contact-id';
const contactName = 'Test Contact';
const mutationSpy = jest.fn();
const setOpen = jest.fn();
const deleteContact = jest.fn();

interface TestComponentProps {
  open?: boolean;
  deleting?: boolean;
  contactSource?: ContactSourceEnum;
  addressSources?: string[];
  emailSources?: string[];
  phoneSources?: string[];
  accountNumbers?: string[];
}

const TestComponent: React.FC<TestComponentProps> = ({
  open = true,
  deleting = false,
  contactSource = ContactSourceEnum.Mpdx,
  addressSources = [],
  emailSources = [],
  phoneSources = [],
  accountNumbers = [],
}) => (
  <SnackbarProvider>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <TestRouter router={{ query: { accountListId: 'accountListId' } }}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<{
            Contact: ContactSourceQuery;
          }>
            mocks={{
              ContactSource: {
                contact: {
                  id: contactId,
                  name: contactName,
                  source: contactSource,
                  contactDonorAccounts: {
                    nodes: accountNumbers.map((accountNumber) => ({
                      donorAccount: {
                        accountNumber,
                      },
                    })),
                  } as unknown as ContactDonorAccountConnection,
                  addresses: {
                    nodes: addressSources.map((source) => ({ source })),
                  },
                  people: {
                    nodes: [
                      {
                        emailAddresses: {
                          nodes: emailSources.map((source) => ({ source })),
                        },
                        phoneNumbers: {
                          nodes: phoneSources.map((source) => ({ source })),
                        },
                      },
                      {
                        emailAddresses: {
                          nodes: emailSources.map((source) => ({ source })),
                        },
                        phoneNumbers: {
                          nodes: phoneSources.map((source) => ({ source })),
                        },
                      },
                    ],
                  },
                },
              },
            }}
            onCall={mutationSpy}
          >
            <DeleteContactModal
              open={open}
              setOpen={setOpen}
              deleting={deleting}
              deleteContact={deleteContact}
              contactId={contactId}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>
    </LocalizationProvider>
  </SnackbarProvider>
);

describe('DeleteContactModal', () => {
  it('should not show modal if not open', () => {
    const { queryByText } = render(<TestComponent open={false} />);

    expect(
      queryByText(/Are you sure you want to permanently delete this contact?/),
    ).not.toBeInTheDocument();
  });

  it('should be able to delete contact', async () => {
    const { getByText, getByRole } = render(<TestComponent />);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('ContactSource');
    });

    expect(
      getByText(/Are you sure you want to permanently delete this contact?/),
    ).toBeInTheDocument();

    expect(getByRole('button', { name: 'delete contact' })).toBeInTheDocument();
  });

  it('should prevent user from deleting contact while currently deleting contact', async () => {
    const { getByRole } = render(<TestComponent deleting={true} />);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('ContactSource');
    });

    expect(getByRole('button', { name: 'delete contact' })).toBeDisabled();
  });

  describe('Show third party message', () => {
    interface TestProps {
      testName: string;
      props: TestComponentProps;
    }
    const tests: TestProps[] = [
      {
        testName: 'disables deletion if contact created by third party',
        props: { contactSource: ContactSourceEnum.GiveSite },
      },
      {
        testName:
          "disables deletion if a contact's address is sourced by a third party",
        props: {
          addressSources: ['Siebel', 'MPDX'],
        },
      },
      {
        testName:
          "disables deletion if a contact's phone or email is sourced by a third party",
        props: {
          emailSources: ['Siebel', 'MPDX'],
          phoneSources: ['Siebel', 'MPDX'],
        },
      },
      {
        testName:
          "disables deletion if only one contact's phone number is sourced by a third party",
        props: {
          emailSources: ['MPDX', 'MPDX'],
          phoneSources: ['MPDX', 'Siebel'],
        },
      },
    ];

    test.each(tests)('$testName', async ({ props }) => {
      const { findByText, getByRole } = render(<TestComponent {...props} />);

      expect(
        await findByText(
          /its data may sync with Donation Services or other third-party systems/,
        ),
      ).toBeInTheDocument();

      expect(
        getByRole('button', { name: 'delete contact' }),
      ).toBeInTheDocument();
    });

    it('should show third party source for contact', async () => {
      const { findByText } = render(
        <TestComponent
          contactSource={ContactSourceEnum.GiveSite}
          addressSources={['Siebel', 'MPDX']}
          emailSources={['Siebel', 'MPDX']}
          phoneSources={['Siebel', 'MPDX']}
        />,
      );

      expect(await findByText('Contact: GIVE_SITE')).toBeInTheDocument();
      expect(
        await findByText('Address: US Donation Services'),
      ).toBeInTheDocument();
      expect(
        await findByText('Email: US Donation Services'),
      ).toBeInTheDocument();
      expect(
        await findByText('Phone: US Donation Services'),
      ).toBeInTheDocument();
    });

    it('should add the partner account numbers in the email link', async () => {
      process.env.DONATION_SERVICES_EMAIL = 'email@cru.org';
      const partnerAccountNumbers = ['12345', '67890'];
      const { findByText } = render(
        <TestComponent
          contactSource={ContactSourceEnum.GiveSite}
          addressSources={['Siebel', 'MPDX']}
          emailSources={['Siebel', 'MPDX']}
          phoneSources={['Siebel', 'MPDX']}
          accountNumbers={partnerAccountNumbers}
        />,
      );

      const donationServicesLink = await findByText(
        'email Donation Services to request deletion.',
      );
      const emailLink = createEmailLink({ partnerAccountNumbers, contactName });
      expect(donationServicesLink).toHaveAttribute('href', emailLink);
      expect(donationServicesLink).toHaveAttribute('target', '_blank');
    });
  });

  describe('Show normal delete message', () => {
    it('should show modal and be able to delete user', async () => {
      const { getByText, getByRole } = render(
        <TestComponent
          contactSource={ContactSourceEnum.Mpdx}
          addressSources={['MPDX', 'MPDX']}
          emailSources={['MPDX', 'MPDX']}
          phoneSources={['MPDX', 'MPDX']}
        />,
      );

      await waitFor(() => {
        expect(mutationSpy).toHaveGraphqlOperation('ContactSource');
      });

      expect(
        getByText(/Are you sure you want to permanently delete this contact?/),
      ).toBeInTheDocument();

      expect(
        getByRole('button', { name: 'delete contact' }),
      ).toBeInTheDocument();
    });
  });
});
