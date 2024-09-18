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
const handleSetupChange = jest.fn();
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
            localeDisplay={localeDisplay}
            handleSetupChange={handleSetupChange}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const label = 'Locale';

describe('LocaleAccordion', () => {
  afterEach(() => {
    mutationSpy.mockClear();
  });
  it('should render accordion closed', () => {
    const { getByText, queryByRole } = render(
      <Components localeDisplay={'en-GB'} expandedPanel="" />,
    );

    expect(getByText(label)).toBeInTheDocument();
    expect(queryByRole('combobox')).not.toBeInTheDocument();
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

  it('Changes and saves the input', async () => {
    const { getByRole, getByText } = render(
      <Components localeDisplay={'es-419'} expandedPanel={label} />,
    );
    const input = getByRole('combobox');
    const button = getByRole('button', { name: 'Save' });

    await waitFor(() => {
      expect(
        getByText('Latin American Spanish (es-419) (español latinoamericano)'),
      ).toBeInTheDocument();
    });

    userEvent.type(input, 'Filipino');
    userEvent.click(getByText('Filipino (fil) (Filipino)'));
    userEvent.click(button);

    await waitFor(() => {
      expect(mutationSpy.mock.lastCall).toMatchObject([
        {
          operation: {
            operationName: 'UpdatePersonalPreferences',
            variables: {
              input: {
                attributes: {
                  localeDisplay: 'fil',
                },
              },
            },
          },
        },
      ]);
    });
  });
});
