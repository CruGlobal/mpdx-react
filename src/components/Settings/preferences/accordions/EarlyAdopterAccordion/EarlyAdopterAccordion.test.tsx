import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { UserPreferenceContext } from 'src/components/User/Preferences/UserPreferenceProvider';
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
          <UserPreferenceContext.Provider value={{ locale: 'en-US' }}>
            <EarlyAdopterAccordion
              handleAccordionChange={handleAccordionChange}
              expandedPanel={expandedPanel}
              tester={tester}
              accountListId={accountListId}
            />
          </UserPreferenceContext.Provider>
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const label = 'Early Adopter';

describe('EarlyAdopterAccordion', () => {
  afterEach(() => {
    mutationSpy.mockClear();
  });
  it('should render accordion closed', () => {
    const { getByText, queryByRole } = render(
      <Components tester={true} expandedPanel="" />,
    );

    expect(getByText(label)).toBeInTheDocument();
    expect(queryByRole('combobox')).not.toBeInTheDocument();
  });
  it('should render accordion open', async () => {
    const { getByRole } = render(
      <Components tester={true} expandedPanel={label} />,
    );

    expect(getByRole('checkbox')).toBeInTheDocument();
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

  it('Changes and saves the input', async () => {
    const { getByRole } = render(
      <Components tester={false} expandedPanel={label} />,
    );
    const button = getByRole('button', { name: 'Save' });
    userEvent.click(getByRole('checkbox'));
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
                    tester: true,
                  },
                },
              },
            },
          },
        },
      ]);
    });
  });

  describe('onSubmit()', () => {
    it('sets early adopter to true', async () => {
      const { getByRole } = render(
        <Components tester={false} expandedPanel={label} />,
      );
      const button = getByRole('button', { name: 'Save' });
      userEvent.click(getByRole('checkbox'));
      userEvent.click(button);

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith('Saved successfully.', {
          variant: 'success',
        }),
      );
    });

    it('sets early adopter to false', async () => {
      const { getByRole } = render(
        <Components tester={true} expandedPanel={label} />,
      );
      const button = getByRole('button', { name: 'Save' });
      userEvent.click(getByRole('checkbox'));
      userEvent.click(button);

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith('Saved successfully.', {
          variant: 'success',
        }),
      );
    });
  });
});
