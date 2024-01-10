import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { LocaleAccordion } from './LocaleAccordion';

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
  localeDisplay: string;
  expandedPanel: string;
}

const Components: React.FC<ComponentsProps> = ({
  localeDisplay,
  expandedPanel,
}) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider
          onCall={mutationSpy}
          mocks={{
            LoadConstants: {
              constant: {
                locales: [
                  {
                    englishName: 'Filipino (fil)',
                    nativeName: 'Filipino',
                    shortName: 'fil',
                  },
                  {
                    englishName: 'UK English (en-GB)',
                    nativeName: 'UK English',
                    shortName: 'en-GB',
                  },
                  {
                    englishName: 'Latin American Spanish (es-419)',
                    nativeName: 'español latinoamericano',
                    shortName: 'es-419',
                  },
                ],
              },
            },
          }}
        >
          <LocaleAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            loading={false}
            localeDisplay={localeDisplay}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const label = 'Locale';
const inputTestId = 'input' + label.replace(/\s/g, '');

describe('LocaleAccordion', () => {
  it('should render accordion closed', () => {
    const { getByText, queryByTestId } = render(
      <Components localeDisplay={'en-GB'} expandedPanel="" />,
    );

    expect(getByText(label)).toBeInTheDocument();
    expect(queryByTestId(inputTestId)).not.toBeInTheDocument();
  });
  it('should render accordion open and the input should have a value', async () => {
    const { getByText, getByRole, queryByTestId } = render(
      <Components localeDisplay={'es-419'} expandedPanel={label} />,
    );

    const input = getByRole('combobox');
    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(
        getByText('Latin American Spanish (es-419) (español latinoamericano)'),
      ).toBeInTheDocument();
      expect(queryByTestId(inputTestId)).toBeInTheDocument();
      expect(input).toHaveValue(
        'Latin American Spanish (es-419) (español latinoamericano)',
      );
      expect(button).not.toBeDisabled();
    });
  });

  it('should set the save button to disabled when the form is invalid', async () => {
    const value = ''; //value is required

    const { getByRole } = render(
      <Components localeDisplay={value} expandedPanel={label} />,
    );

    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('Saves the input', async () => {
    const { getByRole } = render(
      <Components localeDisplay={'en'} expandedPanel={label} />,
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
                  localeDisplay: 'en',
                },
              },
            },
          },
        },
      ]);
    });
  });
  it('should change the locale', async () => {
    const { getByText, getByRole } = render(
      <Components localeDisplay={'en-GB'} expandedPanel={label} />,
    );

    const input = getByRole('combobox');
    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(input).toHaveValue('UK English (en-GB) (UK English)');
    });
    userEvent.click(input);
    userEvent.type(input, 'Filipino');
    userEvent.click(getByText('Filipino (fil) (Filipino)'));
    userEvent.click(button);

    await waitFor(() => {
      expect(input).toHaveValue('Filipino (fil) (Filipino)');
    });
  });
});
