import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  GetOrganizationsQuery,
  GetUsersOrganizationsAccountsQuery,
} from '../Settings/integrations/Organization/Organizations.generated';
import { Connect } from './Connect';

const push = jest.fn();
const router = {
  push,
};

interface TestComponentProps {
  hasOrganizations?: boolean;
}

const mutationSpy = jest.fn();
const TestComponent: React.FC<TestComponentProps> = ({
  hasOrganizations = true,
}) => (
  <TestRouter router={router}>
    <SnackbarProvider>
      <GqlMockedProvider<{
        GetUsersOrganizationsAccounts: GetUsersOrganizationsAccountsQuery;
        getOrganizations: GetOrganizationsQuery;
      }>
        mocks={{
          GetUsersOrganizationsAccounts: {
            userOrganizationAccounts: hasOrganizations
              ? [
                  {
                    id: 'organization-a',
                    organization: { name: 'Organization A' },
                  },
                ]
              : [],
          },
          getOrganizations: {
            organizations: [1, 2, 3].map((id) => ({
              id: `org-${id}`,
              name: `Organization ${id}`,
              disableNewUsers: false,
            })),
          },
        }}
        onCall={mutationSpy}
      >
        <Connect />
      </GqlMockedProvider>
    </SnackbarProvider>
  </TestRouter>
);

describe('Connect', () => {
  it('renders loading spinner', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('progressbar')).toBeInTheDocument();
  });

  describe('with no connected organizations', () => {
    it('renders header, organization picker, and no cancel button', async () => {
      const { findByRole, getByRole, getByText, queryByRole } = render(
        <TestComponent hasOrganizations={false} />,
      );

      expect(
        await findByRole('heading', { name: "It's time to connect!" }),
      ).toBeInTheDocument();
      expect(
        getByText(
          'First, connect your organization to your {{appName}} account.',
        ),
      ).toBeInTheDocument();
      expect(
        getByRole('combobox', { name: 'Organization' }),
      ).toBeInTheDocument();
      expect(queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });

    it('add button connects the organization and refreshes the list', async () => {
      const { findByRole, getByRole } = render(
        <TestComponent hasOrganizations={false} />,
      );

      userEvent.click(await findByRole('combobox', { name: 'Organization' }));
      mutationSpy.mockClear();
      userEvent.click(getByRole('option', { name: 'Organization 1' }));
      userEvent.click(getByRole('button', { name: 'Add Account' }));

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation(
          'CreateOrganizationAccount',
          { input: { attributes: { organizationId: 'org-1' } } },
        ),
      );
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation(
          'GetUsersOrganizationsAccounts',
        ),
      );
    });
  });

  describe('with connected organizations', () => {
    it('renders header and organization list', async () => {
      const { findByRole, getByText } = render(<TestComponent />);

      expect(
        await findByRole('heading', { name: "It's time for awesome!" }),
      ).toBeInTheDocument();
      expect(getByText('Organization A')).toBeInTheDocument();
    });

    it('trash can icon disconnects the organization', async () => {
      const { findByRole } = render(<TestComponent />);

      userEvent.click(
        await findByRole('button', { name: 'Disconnect organization' }),
      );
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation(
          'DeleteOrganizationAccount',
          { input: { id: 'organization-a' } },
        ),
      );
    });

    it('yes button opens organization picker', async () => {
      const { findByRole, getByRole } = render(<TestComponent />);

      userEvent.click(await findByRole('button', { name: 'Yes' }));
      expect(
        getByRole('combobox', { name: 'Organization' }),
      ).toBeInTheDocument();
    });

    it('no button navigates to the next step', async () => {
      const { findByRole } = render(<TestComponent />);

      userEvent.click(await findByRole('button', { name: 'No' }));
      expect(push).toHaveBeenCalledWith('/setup/account');
    });
  });
});
