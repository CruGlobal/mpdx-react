import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetPartnerGivingAnalysisReportQuery } from 'src/components/Reports/PartnerGivingAnalysisReport/PartnerGivingAnalysisReport.generated';
import theme from 'src/theme';
import { ContactFiltersQuery } from '../../contacts/Contacts.generated';
import { ContactsWrapper } from '../../contacts/ContactsWrapper';
import PartnerGivingAnalysisPage from './[[...contactId]].page';

const push = jest.fn();

interface Mocks {
  GetPartnerGivingAnalysisReport: GetPartnerGivingAnalysisReportQuery;
  ContactFilters: ContactFiltersQuery;
}

interface TestingComponentProps {
  routerContactId?: string;
}

const TestingComponent: React.FC<TestingComponentProps> = ({
  routerContactId,
}) => {
  const router = {
    query: {
      accountListId: 'account-list-1',
      contactId: routerContactId ? [routerContactId] : undefined,
    },
    isReady: true,
    push,
  };

  const mocks = {
    GetPartnerGivingAnalysisReport: {
      partnerGivingAnalysisReport: {
        contacts: [
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
                    name: 'Designation Account 1',
                    __typename: 'FilterOption' as const,
                  },
                  {
                    name: 'Designation Account 2',
                    __typename: 'FilterOption' as const,
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
            <ContactsWrapper>
              <PartnerGivingAnalysisPage />
            </ContactsWrapper>
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
    const { findByRole } = render(
      <TestingComponent routerContactId={'contact-1'} />,
    );

    expect(await findByRole('tab', { name: 'Tasks' })).toBeInTheDocument();
  });

  it('renders navigation panel', () => {
    const { getByRole } = render(<TestingComponent />);

    userEvent.click(getByRole('button', { name: 'Toggle Navigation Panel' }));
    expect(getByRole('heading', { name: 'Reports' })).toBeInTheDocument();
  });

  it('renders filters panel', async () => {
    const { getByRole, findByRole } = render(<TestingComponent />);

    userEvent.click(getByRole('img', { name: 'Toggle Filter Panel' }));
    expect(await findByRole('heading', { name: 'Filter' })).toBeInTheDocument();
  });

  it('toggles filter panel', async () => {
    const { findByTestId, getByRole, getByTestId } = render(
      <TestingComponent />,
    );

    const leftPanel = getByTestId('SidePanelsLayoutLeftPanel');

    userEvent.click(getByRole('button', { name: 'Toggle Filter Panel' }));
    expect(leftPanel).toHaveStyle('transform: none');

    userEvent.click(await findByTestId('FilterPanelClose'));
    expect(leftPanel).toHaveStyle('transform: translate(-100%)');
  });

  it('changes the URL when a contact is selected', async () => {
    const { findByRole } = render(<TestingComponent />);

    expect(push).not.toHaveBeenCalled();

    userEvent.click(await findByRole('link', { name: 'John Doe' }));

    expect(push).toHaveBeenCalled();
  });

  it('closes contact panel', async () => {
    const { getByTestId } = render(
      <TestingComponent routerContactId={'contact-1'} />,
    );

    userEvent.click(getByTestId('ContactDetailsHeaderClose'));
    expect(push).toHaveBeenCalledWith(
      '/accountLists/account-list-1/reports/partnerGivingAnalysis/',
    );
  });

  it('calls clearSearchInput', async () => {
    const { findByRole, getByRole, getByPlaceholderText } = render(
      <TestingComponent routerContactId={'contact-1'} />,
    );
    const searchBar = getByPlaceholderText('Search Contacts');
    userEvent.type(searchBar, 'John');
    userEvent.click(getByRole('button', { name: 'Toggle Filter Panel' }));
    userEvent.click(
      await findByRole('combobox', { name: 'Designation Account' }),
    );
    userEvent.click(getByRole('option', { name: 'Designation Account 1' }));
    userEvent.click(getByRole('button', { name: 'Clear All' }));
    expect(searchBar).toHaveValue('');
  });
});
