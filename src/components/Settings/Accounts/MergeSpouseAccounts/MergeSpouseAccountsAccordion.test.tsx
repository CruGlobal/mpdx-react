import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AccountAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import theme from '../../../../theme';
import { MergeSpouseAccountsAccordion } from './MergeSpouseAccountsAccordion';

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

describe('MergeSpouseAccountsAccordion', () => {
  it('should render accordion closed', () => {
    const { getAllByText } = render(
      <Components>
        <GqlMockedProvider>
          <MergeSpouseAccountsAccordion
            handleAccordionChange={handleAccordionChange}
            expandedAccordion={null}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(getAllByText('Merge Spouse Accounts')).toHaveLength(1);
  });
  it('should render accordion open', () => {
    const { getAllByText } = render(
      <Components>
        <GqlMockedProvider>
          <MergeSpouseAccountsAccordion
            handleAccordionChange={handleAccordionChange}
            expandedAccordion={AccountAccordion.MergeSpouseAccounts}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(getAllByText('Merge Spouse Accounts')).toHaveLength(2);
  });
});
