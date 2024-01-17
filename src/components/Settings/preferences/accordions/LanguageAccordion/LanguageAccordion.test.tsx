import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { LanguageAccordion } from './LanguageAccordion';

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
  locale: string;
  expandedPanel: string;
}

const Components: React.FC<ComponentsProps> = ({ locale, expandedPanel }) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={mutationSpy}>
          <LanguageAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            loading={false}
            locale={locale}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const label = 'Language';
const inputTestId = 'input' + label.replace(/\s/g, '');

describe('LanguageAccordion', () => {
  it('should render accordion closed', () => {
    const { getByText, queryByTestId } = render(
      <Components locale={'de'} expandedPanel="" />,
    );

    expect(getByText(label)).toBeInTheDocument();
    expect(queryByTestId(inputTestId)).not.toBeInTheDocument();
  });
  it('should render accordion open and the input should have a value', async () => {
    const { getByText, getByRole, queryByTestId } = render(
      <Components locale={'es-419'} expandedPanel={label} />,
    );

    const input = getByRole('combobox');
    const button = getByRole('button', { name: 'Save' });

    expect(
      getByText('Latin American Spanish (español latinoamericano)'),
    ).toBeInTheDocument();
    expect(queryByTestId(inputTestId)).toBeInTheDocument();

    await waitFor(() => {
      expect(input).toHaveValue(
        'Latin American Spanish (español latinoamericano)',
      );
      expect(button).not.toBeDisabled();
    });
  });

  it('should set the save button to disabled when the form is invalid', async () => {
    const value = ''; //value is required

    const { getByRole } = render(
      <Components locale={value} expandedPanel={label} />,
    );

    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('Saves the input', async () => {
    const { getByRole } = render(
      <Components locale={'en-US'} expandedPanel={label} />,
    );
    const button = getByRole('button', { name: 'Save' });

    userEvent.click(button);

    await waitFor(() => {
      expect(mutationSpy.mock.lastCall).toMatchObject([
        {
          operation: {
            operationName: 'UpdatePersonalPreferences',
            variables: {
              input: {
                attributes: {
                  locale: 'en-US',
                },
              },
            },
          },
        },
      ]);
    });
  });
  it('should change the language', async () => {
    const { getByText, getByRole } = render(
      <Components locale={'en'} expandedPanel={label} />,
    );

    const input = getByRole('combobox');
    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(input).toHaveValue('US English');
    });
    userEvent.click(input);
    userEvent.type(input, 'German');
    userEvent.click(getByText('German (Deutsch)'));
    userEvent.click(button);

    await waitFor(() => {
      expect(input).toHaveValue('German (Deutsch)');
    });
  });
});
