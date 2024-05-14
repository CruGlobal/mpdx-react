import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { OrganizationsQuery } from '../organizations.generated';
import OrganizationsContacts from './contacts.page';

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
          <OrganizationsContacts />
        </I18nextProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('OrganizationsContacts', () => {
  it('should render skeletons while contacts are loading', async () => {
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
    });

    const autoCompleteInput = getByRole('combobox', {
      name: /filter by organization/i,
    });
    expect(autoCompleteInput).toBeInTheDocument();
  });

  it('should call GraphQL on organization and contact search, debouncing requests every 1000ms', async () => {
    const mutationSpy = jest.fn();
    const { getByRole, queryByRole, queryByTestId } = render(
      <Components mutationSpy={mutationSpy} />,
    );

    await waitFor(() => {
      expect(queryByTestId('skeleton')).not.toBeInTheDocument();
    });

    const autoCompleteInput = getByRole('combobox', {
      name: /filter by organization/i,
    });

    expect(
      queryByRole('textbox', {
        name: /search contacts/i,
      }),
    ).not.toBeInTheDocument();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('Organizations'),
    );

    userEvent.type(autoCompleteInput, 'Org');
    expect(getByRole('option', { name: 'Org1' })).toBeInTheDocument();
    userEvent.click(getByRole('option', { name: 'Org2' }));

    const accountInput = getByRole('textbox', {
      name: /search contacts/i,
    });

    userEvent.type(accountInput, 'T');
    jest.advanceTimersByTime(300);
    userEvent.type(accountInput, 'e');
    jest.advanceTimersByTime(300);
    userEvent.type(accountInput, 'st');
    jest.advanceTimersByTime(1000);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'SearchOrganizationsContacts',
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
      'SearchOrganizationsContacts',
      {
        input: {
          search: 'T',
        },
      },
    );
  });
});
