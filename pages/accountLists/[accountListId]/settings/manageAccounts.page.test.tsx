import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AccountAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import theme from 'src/theme';
import ManageAccounts from './manageAccounts.page';

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: jest.fn(),
    };
  },
}));

interface ComponentsProps {
  selectedTab?: string;
}

const Components: React.FC<ComponentsProps> = ({ selectedTab }) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={{ query: { selectedTab } }}>
      <GqlMockedProvider>
        <SnackbarProvider>
          <ManageAccounts />
        </SnackbarProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('ManageAccounts', () => {
  it('should open `Manage Account Access` accordion', async () => {
    const { getAllByText } = render(<Components />);
    await waitFor(() => {
      expect(getAllByText('Manage Account Access').length).toEqual(2);
    });
  });

  it('should open `Merge Your Accounts` accordion', async () => {
    const { getAllByText } = render(
      <Components selectedTab={AccountAccordion.MergeAccounts} />,
    );
    await waitFor(() => {
      expect(getAllByText('Manage Account Access').length).toEqual(1);
      expect(getAllByText('Merge Your Accounts').length).toEqual(2);
    });
  });
});
