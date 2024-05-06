import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { OrganizationsQuery } from '../organizations.generated';
import AccountListsOrganizations from './accountLists.page';

jest.useFakeTimers();

const Components = ({ mutationSpy }: { mutationSpy?: () => void }) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider<{ Organizations: OrganizationsQuery }>
        mocks={{
          Organizations: {
            getOrganizations: {
              organizations: [
                {
                  id: '111',
                  name: 'Org1',
                },
                {
                  id: '222',
                  name: 'Org2',
                },
              ],
            },
          },
        }}
        onCall={mutationSpy}
      >
        <I18nextProvider i18n={i18n}>
          <AccountListsOrganizations />
        </I18nextProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('AccountListsOrganizations', () => {
  it('should render skeletons while organizations are loading', async () => {
    const { queryByRole, getByTestId, queryByTestId, getByRole } = render(
      <Components />,
    );

    expect(getByTestId('skeleton')).toBeInTheDocument();
    expect(
      queryByRole('combobox', {
        name: /filter by organization/i,
      }),
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(queryByTestId('skeleton')).not.toBeInTheDocument();
      expect(
        getByRole('combobox', {
          name: /filter by organization/i,
        }),
      ).toBeInTheDocument();
    });
  });

  it('should call GraphQL on organization and account list search, debouncing requests every 1000ms', async () => {
    const mutationSpy = jest.fn();
    const { getByRole, queryByTestId } = render(
      <Components mutationSpy={mutationSpy} />,
    );

    await waitFor(() => {
      expect(queryByTestId('skeleton')).not.toBeInTheDocument();
    });

    const autoCompleteInput = getByRole('combobox', {
      name: /filter by organization/i,
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('Organizations'),
    );

    userEvent.type(autoCompleteInput, 'Org');
    expect(getByRole('option', { name: 'Org1' })).toBeInTheDocument();
    userEvent.click(getByRole('option', { name: 'Org2' }));

    const accountInput = getByRole('textbox', {
      name: /search account lists/i,
    });

    userEvent.type(accountInput, 'T');
    jest.advanceTimersByTime(300);
    userEvent.type(accountInput, 'e');
    jest.advanceTimersByTime(300);
    userEvent.type(accountInput, 'st');
    jest.advanceTimersByTime(1000);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'SearchOrganizationsAccountLists',
        {
          input: {
            organizationId: '222',
            search: 'Test',
          },
        },
      ),
    );

    // Ensure that debouncing worked and intermediate searches were not performed
    expect(mutationSpy).not.toHaveGraphqlOperation(
      'SearchOrganizationsAccountLists',
      {
        input: {
          search: 'T',
        },
      },
    );
  });
});
