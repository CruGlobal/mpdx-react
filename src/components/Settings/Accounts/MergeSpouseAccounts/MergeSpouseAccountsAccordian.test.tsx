import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@mui/material/styles';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { MergeSpouseAccountsAccordian } from './MergeSpouseAccountsAccordian';

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

describe('MergeSpouseAccountsAccordian', () => {
  it('should render accordian closed', async () => {
    const { getAllByText } = render(
      Components(
        <GqlMockedProvider>
          <MergeSpouseAccountsAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={''}
          />
        </GqlMockedProvider>,
      ),
    );
    expect(getAllByText('Merge Spouse Accounts')[0]).toBeInTheDocument();
    expect(getAllByText('Merge Spouse Accounts')[1]).not.toBeVisible();
  });
  it('should render accordian open', async () => {
    const { getAllByText } = render(
      Components(
        <GqlMockedProvider>
          <MergeSpouseAccountsAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Merge Spouse Accounts'}
          />
        </GqlMockedProvider>,
      ),
    );
    expect(getAllByText('Merge Spouse Accounts')[1]).toBeVisible();
  });
});
