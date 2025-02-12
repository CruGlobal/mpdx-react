import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AccountAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import theme from '../../../../theme';
import { MergeAccountsAccordion } from './MergeAccountsAccordion';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
const contactId = 'contact-1';
const router = {
  query: { accountListId, contactId: [contactId] },
  isReady: true,
};

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const handleAccordionChange = jest.fn();

const Components = ({ children }: PropsWithChildren) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('MergeAccountsAccordion', () => {
  it('should render accordion closed', async () => {
    const { queryAllByText } = render(
      <Components>
        <GqlMockedProvider>
          <MergeAccountsAccordion
            handleAccordionChange={handleAccordionChange}
            expandedAccordion={null}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(queryAllByText('Merge Your Accounts')[0]).toBeInTheDocument();
    expect(queryAllByText('Merge Your Accounts')[1]).toBeUndefined();
  });
  it('should render accordion open', async () => {
    const { getAllByText } = render(
      <Components>
        <GqlMockedProvider>
          <MergeAccountsAccordion
            handleAccordionChange={handleAccordionChange}
            expandedAccordion={AccountAccordion.MergeAccounts}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(getAllByText('Merge Your Accounts')[1]).toBeInTheDocument();
  });
});
