import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { EarlyAdopterAccordion } from './EarlyAdopterAccordion';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
const router = {
  query: { accountListId },
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
const mutationSpy = jest.fn();

interface ComponentsProps {
  tester: boolean;
  expandedPanel: string;
}

const Components: React.FC<ComponentsProps> = ({ tester, expandedPanel }) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={mutationSpy}>
          <EarlyAdopterAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            loading={false}
            tester={tester}
            accountListId={accountListId}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const label = 'Early Adopter';
const inputTestId = 'input' + label.replace(/\s/g, '');

describe('EarlyAdopterAccordion', () => {
  it('should render accordion closed', () => {
    const { getByText, queryByTestId } = render(
      <Components tester={true} expandedPanel="" />,
    );

    expect(getByText(label)).toBeInTheDocument();
    expect(queryByTestId(inputTestId)).not.toBeInTheDocument();
  });
  it('should render accordion open', async () => {
    const { queryByTestId } = render(
      <Components tester={true} expandedPanel={label} />,
    );

    expect(queryByTestId(inputTestId)).toBeInTheDocument();
  });

  it('should always have the save button enabled', async () => {
    const { getByRole } = render(
      <Components tester={true} expandedPanel={label} />,
    );
    const input = getByRole('checkbox');
    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });

    userEvent.click(input);

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('Saves the input', async () => {
    const { getByRole } = render(
      <Components tester={false} expandedPanel={label} />,
    );
    const button = getByRole('button', { name: 'Save' });

    userEvent.click(button);

    await waitFor(() => {
      expect(mutationSpy.mock.lastCall).toMatchObject([
        {
          operation: {
            operationName: 'UpdateAccountPreferences',
            variables: {
              input: {
                id: accountListId,
                attributes: {
                  id: accountListId,
                  settings: {
                    tester: false,
                  },
                },
              },
            },
          },
        },
      ]);
    });
  });
});
