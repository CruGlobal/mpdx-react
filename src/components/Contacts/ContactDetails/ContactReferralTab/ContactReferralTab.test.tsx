import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import { ContactReferralTab } from './ContactReferralTab';
import { ContactReferralTabQuery } from './ContactReferralTab.generated';

const accountListId = 'accountListId';
const contactId = 'contactId';

const router = {
  query: {
    accountListId,
  },
  pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
};

const referralNode = {
  id: 'referral-id',
  createdAt: '2021-04-29T07:48:28+0000',
  referredTo: {
    id: 'contact-id-2',
    name: 'name-2',
  },
};

interface TestComponentProps {
  mocks?: { ContactReferralTab: ContactReferralTabQuery };
  onCall?: jest.Mock;
}

const pageInfo = { hasNextPage: false, endCursor: null };

const oneReferralMock = {
  ContactReferralTab: {
    contact: {
      id: 'contact-id',
      name: 'name',
      contactReferralsByMe: {
        nodes: [referralNode],
        pageInfo,
      },
    },
  },
};

const TestComponent: React.FC<TestComponentProps> = ({
  mocks = oneReferralMock,
  onCall,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <SnackbarProvider>
        <GqlMockedProvider<{ ContactReferralTab: ContactReferralTabQuery }>
          mocks={mocks}
          onCall={onCall}
        >
          <ContactPanelProvider>
            <ContactReferralTab
              accountListId={accountListId}
              contactId={contactId}
            />
          </ContactPanelProvider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('ContactReferralTab', () => {
  it('test render', async () => {
    const { findByText } = render(
      <TestComponent
        mocks={{
          ContactReferralTab: {
            contact: {
              id: 'contact-id',
              name: 'name',
              contactReferralsByMe: {
                nodes: [],
                pageInfo,
              },
            },
          },
        }}
      />,
    );
    expect(await findByText('No Connections')).toBeVisible();
  });

  it('tests render with data and click event', async () => {
    const { findByRole } = render(<TestComponent />);

    const contactLink = await findByRole('link', { name: 'name-2' });

    expect(contactLink).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/contacts/contact-id-2`,
    );
  });

  it('opens a confirmation when the remove button is clicked', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    userEvent.click(
      await findByRole('button', { name: 'Remove Connection name-2' }),
    );

    expect(await findByRole('button', { name: 'Yes' })).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Remove Connection' }),
    ).toBeInTheDocument();
  });

  it('does not fire the mutation when removal is cancelled', async () => {
    const mutationSpy = jest.fn();
    const { findByRole } = render(<TestComponent onCall={mutationSpy} />);

    userEvent.click(
      await findByRole('button', { name: 'Remove Connection name-2' }),
    );
    userEvent.click(await findByRole('button', { name: 'No' }));

    // The connection is still shown and no delete mutation was sent.
    expect(await findByRole('link', { name: 'name-2' })).toBeInTheDocument();
    expect(mutationSpy).not.toHaveGraphqlOperation('DeleteContactReferral');
  });

  it('removes the connection when confirmed', async () => {
    const mutationSpy = jest.fn();
    const { findByRole, queryByRole } = render(
      <TestComponent onCall={mutationSpy} />,
    );

    userEvent.click(
      await findByRole('button', { name: 'Remove Connection name-2' }),
    );
    userEvent.click(await findByRole('button', { name: 'Yes' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('DeleteContactReferral', {
        accountListId,
        contactId,
        referralId: 'referral-id',
      }),
    );

    await waitFor(() =>
      expect(queryByRole('link', { name: 'name-2' })).not.toBeInTheDocument(),
    );
  });
});
