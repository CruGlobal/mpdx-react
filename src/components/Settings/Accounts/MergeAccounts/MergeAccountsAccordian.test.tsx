import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@mui/material/styles';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { MergeAccountsAccordian } from './MergeAccountsAccordian';

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

const Components = (children: React.ReactElement) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('MergeAccountsAccordian', () => {
  it('should render accordian closed', async () => {
    const { getAllByText } = render(
      Components(
        <GqlMockedProvider>
          <MergeAccountsAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={''}
          />
        </GqlMockedProvider>,
      ),
    );
    expect(getAllByText('Merge Your Accounts')[0]).toBeInTheDocument();
    expect(getAllByText('Merge Your Accounts')[1]).not.toBeVisible();
  });
  it('should render accordian open', async () => {
    const { getAllByText } = render(
      Components(
        <GqlMockedProvider>
          <MergeAccountsAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Merge Your Accounts'}
          />
        </GqlMockedProvider>,
      ),
    );
    expect(getAllByText('Merge Your Accounts')[1]).toBeInTheDocument();
  });
});
