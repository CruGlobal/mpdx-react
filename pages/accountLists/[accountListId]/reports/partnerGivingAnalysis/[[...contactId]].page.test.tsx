import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PartnerGivingAnalysisQuery } from 'src/components/Reports/PartnerGivingAnalysisReport/PartnerGivingAnalysis.generated';
import theme from 'src/theme';
import { ContactFiltersQuery } from '../../contacts/Contacts.generated';
import PartnerGivingAnalysisPage from './[[...contactId]].page';

const push = jest.fn();
const replace = jest.fn();

interface Mocks {
  PartnerGivingAnalysis: PartnerGivingAnalysisQuery;
  ContactFilters: ContactFiltersQuery;
}

interface TestingComponentProps {
  routerHasContactId?: boolean;
  routerHasSearchTerm?: boolean;
}

const TestingComponent: React.FC<TestingComponentProps> = ({
  routerHasContactId = false,
  routerHasSearchTerm = false,
}) => {
  const router = {
    query: {
      accountListId: 'account-list-1',
      contactId: routerHasContactId
        ? ['00000000-0000-0000-0000-000000000000']
        : undefined,
      searchTerm: routerHasSearchTerm ? 'John' : undefined,
    },
    isReady: true,
    push,
    replace,
  };

  const mocks = {
    PartnerGivingAnalysis: {
      partnerGivingAnalysis: {
        nodes: [
          {
            id: 'contact-1',
            name: 'John Doe',
            lastDonationCurrency: 'USD',
            pledgeCurrency: 'USD',
          },
        ],
      },
    },
    ContactFilters: {
      accountList: {
        partnerGivingAnalysisFilterGroups: [
          {
            filters: [
              {
                __typename: 'MultiselectFilter' as const,
                filterKey: 'designation_account_id',
                title: 'Designation Account',
                defaultSelection: '',
                options: [
                  {
                    __typename: 'FilterOption' as const,
                    name: 'Designation Account 1',
                    value: 'designation-account-1',
                  },
                  {
                    __typename: 'FilterOption' as const,
                    name: 'Designation Account 2',
                    value: 'designation-account-2',
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<Mocks> mocks={mocks}>
          <SnackbarProvider>
            <PartnerGivingAnalysisPage />
          </SnackbarProvider>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('partnerGivingAnalysis page', () => {
  it('renders', () => {
    const { getByRole } = render(<TestingComponent />);

    expect(
      getByRole('heading', { name: 'Partner Giving Analysis' }),
    ).toBeInTheDocument();
  });

  it('renders contact panel', async () => {
    const { findByRole } = render(<TestingComponent routerHasContactId />);

    expect(await findByRole('tab', { name: 'Tasks' })).toBeInTheDocument();
  });

  it('renders navigation panel', () => {
    const { getByRole } = render(<TestingComponent />);

    userEvent.click(getByRole('button', { name: 'Toggle Navigation Panel' }));
    expect(getByRole('heading', { name: 'Reports' })).toBeInTheDocument();
  });

  it('renders filters panel', async () => {
    const { findByRole } = render(<TestingComponent />);

    expect(
      await findByRole('complementary', { name: 'Filter' }),
    ).toBeInTheDocument();
  });

  it('toggles filter panel', async () => {
    const { findByTestId, getByRole, getByTestId } = render(
      <TestingComponent />,
    );

    const leftPanel = getByTestId('SidePanelsLayoutLeftPanel');

    userEvent.click(await findByTestId('FilterPanelClose'));
    expect(leftPanel).toHaveStyle('transform: translate(-100%)');

    userEvent.click(getByRole('button', { name: 'Toggle Filter Panel' }));
    expect(leftPanel).toHaveStyle('transform: none');
  });

  it('changes the URL when a contact is selected', async () => {
    const { findByRole } = render(<TestingComponent />);

    expect(push).not.toHaveBeenCalled();

    userEvent.click(await findByRole('link', { name: 'John Doe' }));

    expect(push).toHaveBeenCalled();
  });

  it('closes contact panel', async () => {
    const { findByTestId } = render(<TestingComponent routerHasContactId />);

    userEvent.click(await findByTestId('ContactDetailsHeaderClose'));
    expect(push).toHaveBeenCalledWith(
      expect.objectContaining({
        query: {
          accountListId: 'account-list-1',
        },
      }),
      undefined,
      { shallow: true },
    );
  });

  it('updates filters', async () => {
    const { findByRole, getByRole, getByPlaceholderText } = render(
      <TestingComponent routerHasContactId />,
    );
    const searchBar = getByPlaceholderText('Search Contacts');
    userEvent.type(searchBar, 'John');
    userEvent.click(
      await findByRole('combobox', { name: 'Designation Account' }),
    );
    userEvent.click(getByRole('option', { name: 'Designation Account 1' }));

    await waitFor(() =>
      expect(replace.mock.lastCall[0].query).toEqual(
        expect.objectContaining({
          filters: '{"designationAccountId":["designation-account-1"]}',
          searchTerm: 'John',
        }),
      ),
    );
  }, 20000);

  it('clears search term', async () => {
    const { findByRole, getByRole } = render(
      <TestingComponent routerHasContactId routerHasSearchTerm />,
    );
    userEvent.click(
      await findByRole('combobox', { name: 'Designation Account' }),
    );
    userEvent.click(getByRole('option', { name: 'Designation Account 1' }));
    userEvent.click(getByRole('button', { name: 'Clear All' }));

    expect(replace.mock.lastCall[0].query.searchTerm).toBeUndefined();
  });
});
