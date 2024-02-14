import { GetServerSidePropsContext } from 'next';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getSession } from 'next-auth/react';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { OrganizationsQuery } from '../organizations.generated';
import AccountListsOrganizations, {
  getServerSideProps,
} from './accountLists.page';

jest.mock('next-auth/react', () => ({ getSession: jest.fn() }));
jest.useFakeTimers();
interface getServerSidePropsReturn {
  props: unknown;
  redirect: unknown;
}

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
  const context = {
    query: {
      accountListId: 'accountListId',
    },
  } as unknown as GetServerSidePropsContext;

  describe('No admin access', () => {
    it('should redirect to dashboard', async () => {
      (getSession as jest.Mock).mockReturnValue({
        user: {
          admin: false,
        },
      });

      const { props, redirect } = (await getServerSideProps(
        context,
      )) as getServerSidePropsReturn;

      expect(props).toBeUndefined();
      expect(redirect).toEqual({
        destination: '/accountLists/accountListId',
        permanent: false,
      });
    });
  });

  describe('Has admin access', () => {
    beforeEach(() => {
      (getSession as jest.Mock).mockReturnValue({
        user: {
          admin: true,
        },
      });
    });

    it('renders page without redirecting admin', async () => {
      const { props, redirect } = (await getServerSideProps(
        context as GetServerSidePropsContext,
      )) as getServerSidePropsReturn;

      expect(redirect).toBeUndefined();
      expect(props).toEqual({});
    });

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

      expect(autoCompleteInput).toBeInTheDocument();

      userEvent.type(autoCompleteInput, 'O');
      jest.advanceTimersByTime(300);
      userEvent.type(autoCompleteInput, 'r');
      jest.advanceTimersByTime(300);
      userEvent.type(autoCompleteInput, 'g');
      jest.advanceTimersByTime(1000);

      expect(getByRole('option', { name: 'Org1' })).toBeInTheDocument();
      expect(getByRole('option', { name: 'Org2' })).toBeInTheDocument();

      userEvent.click(getByRole('option', { name: 'Org2' }));

      await waitFor(() => expect(mutationSpy).toHaveBeenCalledTimes(4));

      // This will be replaced with PR 868 that helps with tracking mutationSpys
      const searchQuery = mutationSpy.mock.calls.find(
        (call) =>
          call[0].operation.operationName === 'SearchOrganizationsAccountLists',
      );

      expect(searchQuery[0].operation.operationName).toEqual(
        'SearchOrganizationsAccountLists',
      );
      expect(searchQuery[0].operation.variables).toEqual({
        input: {
          organizationId: '222',
          search: '',
        },
      });

      const accountInput = getByRole('textbox', {
        name: /search account lists/i,
      });

      userEvent.type(accountInput, 'T');
      jest.advanceTimersByTime(300);
      userEvent.type(accountInput, 'e');
      jest.advanceTimersByTime(300);
      userEvent.type(accountInput, 'st');
      jest.advanceTimersByTime(1000);

      // This call takes some time to come through, which is why I'm using timeout
      await waitFor(() => expect(mutationSpy).toHaveBeenCalledTimes(5));

      expect(mutationSpy.mock.calls[4][0].operation.operationName).toEqual(
        'SearchOrganizationsAccountLists',
      );
      expect(mutationSpy.mock.calls[4][0].operation.variables).toEqual({
        input: {
          organizationId: '222',
          search: 'Test',
        },
      });
    });
  });
});
