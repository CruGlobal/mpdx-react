import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import { ContactReferralTab } from './ContactReferralTab';
import {
  ContactReferralTabQuery,
  DeleteContactReferralMutation,
} from './ContactReferralTab.generated';

const accountListId = 'accountListId';
const contactId = 'contactId';

const router = {
  query: {
    accountListId,
  },
  pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
};

const pageInfo = { hasNextPage: false, endCursor: null };

const referralNode = {
  id: 'referral-id',
  createdAt: '2021-04-29T07:48:28+0000',
  referredTo: {
    id: 'contact-id-2',
    name: 'name-2',
  },
};

const secondReferralNode = {
  id: 'referral-id-2',
  createdAt: '2021-05-01T07:48:28+0000',
  referredTo: {
    id: 'contact-id-3',
    name: 'name-3',
  },
};

type Mocks = {
  ContactReferralTab: ContactReferralTabQuery;
  DeleteContactReferral: DeleteContactReferralMutation;
};

type ReferralMockNode = {
  id: string;
  createdAt: string;
  referredTo: { id: string; name: string };
};

const buildMocks = (nodes: ReferralMockNode[]): ApolloErgonoMockMap => ({
  ContactReferralTab: {
    contact: {
      id: 'contact-id',
      name: 'name',
      contactReferralsByMe: {
        nodes,
        pageInfo,
      },
    },
  },
});

const oneReferralMock = buildMocks([referralNode]);

interface TestComponentProps {
  mocks?: ApolloErgonoMockMap;
  onCall?: jest.Mock;
}

const TestComponent: React.FC<TestComponentProps> = ({
  mocks = oneReferralMock,
  onCall,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <SnackbarProvider>
        <GqlMockedProvider<Mocks>
          mocks={mocks as ApolloErgonoMockMap}
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
    const { findByText } = render(<TestComponent mocks={buildMocks([])} />);
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
    const { findByRole } = render(<TestComponent />);

    await userEvent.click(
      await findByRole('button', { name: 'Remove Connection name-2' }),
    );

    expect(await findByRole('button', { name: 'Yes' })).toBeInTheDocument();
    expect(
      await findByRole('heading', { name: 'Remove Connection' }),
    ).toBeInTheDocument();
  });

  it('does not fire the mutation when removal is cancelled', async () => {
    const mutationSpy = jest.fn();
    const { findByRole, queryByRole } = render(
      <TestComponent onCall={mutationSpy} />,
    );

    await userEvent.click(
      await findByRole('button', { name: 'Remove Connection name-2' }),
    );
    await userEvent.click(await findByRole('button', { name: 'No' }));

    // The dialog closes, the connection is still shown, and no mutation fired.
    await waitFor(() =>
      expect(queryByRole('button', { name: 'Yes' })).not.toBeInTheDocument(),
    );
    expect(await findByRole('link', { name: 'name-2' })).toBeInTheDocument();
    expect(mutationSpy).not.toHaveGraphqlOperation('DeleteContactReferral');
  });

  it('removes the connection and shows a success message when confirmed', async () => {
    const mutationSpy = jest.fn();
    const { findByRole, findByText, queryByRole } = render(
      <TestComponent onCall={mutationSpy} />,
    );

    await userEvent.click(
      await findByRole('button', { name: 'Remove Connection name-2' }),
    );
    await userEvent.click(await findByRole('button', { name: 'Yes' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('DeleteContactReferral', {
        accountListId,
        contactId,
        referralId: 'referral-id',
      }),
    );

    expect(
      await findByText('Connection removed successfully'),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(queryByRole('link', { name: 'name-2' })).not.toBeInTheDocument(),
    );
  });

  it('removes the correct connection when multiple are present', async () => {
    const mutationSpy = jest.fn();
    const { findByRole } = render(
      <TestComponent
        mocks={buildMocks([referralNode, secondReferralNode])}
        onCall={mutationSpy}
      />,
    );

    await userEvent.click(
      await findByRole('button', { name: 'Remove Connection name-3' }),
    );
    await userEvent.click(await findByRole('button', { name: 'Yes' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('DeleteContactReferral', {
        accountListId,
        contactId,
        referralId: 'referral-id-2',
      }),
    );
  });

  it('shows an error message when removal fails', async () => {
    const { findByRole, findByText } = render(
      <TestComponent
        mocks={{
          ...oneReferralMock,
          DeleteContactReferral: () => {
            throw new Error('Server error');
          },
        }}
      />,
    );

    await userEvent.click(
      await findByRole('button', { name: 'Remove Connection name-2' }),
    );
    await userEvent.click(await findByRole('button', { name: 'Yes' }));

    expect(await findByText('Unable to remove connection')).toBeInTheDocument();
    // The connection remains because the deletion did not succeed.
    expect(await findByRole('link', { name: 'name-2' })).toBeInTheDocument();
  });
});
