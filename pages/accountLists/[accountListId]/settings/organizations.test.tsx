import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { OrganizationInvitesQuery } from 'src/components/Settings/Organization/ManageOrganizationAccess/ManageOrganizationAccess.generated';
import theme from 'src/theme';
import { OrganizationsQuery } from './organizations.generated';
import Organizations from './organizations.page';

const mockEnqueue = jest.fn();

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueue,
  }),
}));

const accountListId = 'account-list-1';
const router = {
  query: { accountListId },
  isReady: true,
};

const TestComponent: React.FC = () => (
  <TestRouter router={router}>
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{
        Organizations: OrganizationsQuery;
        OrganizationInvites: OrganizationInvitesQuery;
      }>
        mocks={{
          Organizations: {
            getOrganizations: {
              organizations: [
                {
                  name: 'Organization 1',
                },
                {
                  name: 'Organization 2',
                },
              ],
            },
          },
          OrganizationInvites: {
            organizationInvites: [],
          },
        }}
      >
        <Organizations />
      </GqlMockedProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('Organizations page', () => {
  it('selects the first organization', async () => {
    const { getByRole, getByText } = render(<TestComponent />);

    await waitFor(() =>
      expect(getByRole('combobox', { name: 'Organization' })).toHaveValue(
        'Organization 1',
      ),
    );

    expect(getByText('Manage Organization 1')).toBeInTheDocument();
  });

  it('updates the selected organization', async () => {
    const { getByRole, getByText } = render(<TestComponent />);

    await waitFor(() =>
      expect(getByText('Manage Organization 1')).toBeInTheDocument(),
    );

    userEvent.click(getByRole('combobox', { name: 'Organization' }));
    userEvent.click(getByRole('option', { name: 'Organization 2' }));
    expect(getByText('Manage Organization 2')).toBeInTheDocument();
  });
});
