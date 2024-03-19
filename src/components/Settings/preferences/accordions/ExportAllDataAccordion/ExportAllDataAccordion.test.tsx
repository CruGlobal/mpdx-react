import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { ExportDataMutation } from '../../GetAccountPreferences.generated';
import { ExportAllDataAccordion } from './ExportAllDataAccordion';

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
  expandedPanel: string;
  exportedAt?: string;
}

const Components: React.FC<ComponentsProps> = ({
  expandedPanel,
  exportedAt,
}) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          ExportData: ExportDataMutation;
        }>
          mocks={{
            ExportData: {
              exportData: 'Success',
            },
          }}
          onCall={mutationSpy}
        >
          <ExportAllDataAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            exportedAt={exportedAt || ''}
            accountListId={accountListId}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const label = 'Export All Data';
const descriptionText =
  "Please ensure you've read the above before continuing.";

describe('Export All Data Accordion', () => {
  beforeEach(() => {
    mutationSpy.mockClear();
  });
  it('should render accordion closed', () => {
    const { getByText, queryByText } = render(<Components expandedPanel="" />);

    expect(getByText(label)).toBeInTheDocument();
    expect(queryByText(descriptionText)).not.toBeInTheDocument();
  });
  it('should render accordion open and show the last exported date', async () => {
    const { getByText, queryByRole } = render(
      <Components
        expandedPanel={label}
        exportedAt={DateTime.local(2024, 1, 16, 18, 34, 12).toISO() ?? ''}
      />,
    );

    expect(getByText(descriptionText)).toBeInTheDocument();
    expect(queryByRole('alert')).toBeInTheDocument();
  });

  it('should default the submit button to disabled unless the box is checked', async () => {
    const { getAllByRole, queryByRole } = render(
      <Components expandedPanel={label} />,
    );
    const button = getAllByRole('button', {
      name: 'Export All Data',
    })[1];

    expect(queryByRole('alert')).not.toBeInTheDocument(); //Last exported date Alert not in the document

    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    await waitFor(() => {
      expect(mutationSpy).not.toHaveBeenCalled();
    });
  });
  it('should enable the submit button and call the mutation', async () => {
    const { getByRole, getAllByRole, queryByRole, getByText } = render(
      <Components expandedPanel={label} />,
    );
    const input = getByRole('checkbox');
    const button = getAllByRole('button', { name: 'Export All Data' })[1];

    userEvent.click(input);

    await waitFor(() => {
      expect(queryByRole('alert')).not.toBeInTheDocument(); //Last exported date Alert not in the document
      expect(input).toBeChecked();
      expect(button).not.toBeDisabled();
    });

    userEvent.click(button);

    await waitFor(() => {
      expect(mutationSpy.mock.lastCall).toMatchObject([
        {
          operation: {
            operationName: 'ExportData',
            variables: {
              input: {
                accountListId: accountListId,
              },
            },
          },
        },
      ]);
      expect(mockEnqueue).toHaveBeenCalledWith('Export has started.', {
        variant: 'success',
      });
      expect(
        getByText(
          'Once the export is completed, we will send you an email with a link to download your export.',
        ),
      ).toBeInTheDocument();
    });
  });
});
