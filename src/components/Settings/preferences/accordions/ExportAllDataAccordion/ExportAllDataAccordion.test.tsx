import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
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

interface ComponentsProps {
  expandedPanel: string;
}

const Components: React.FC<ComponentsProps> = ({ expandedPanel }) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider
          mocks={{
            GetExportData: {},
          }}
        >
          <ExportAllDataAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
            loading={false}
            exportedAt={'2024-01-05T18:34:12-08:00'}
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
  it('should render accordion closed', () => {
    const { getByText, queryByText } = render(<Components expandedPanel="" />);

    expect(getByText(label)).toBeInTheDocument();
    expect(queryByText(descriptionText)).not.toBeInTheDocument();
  });
  it('should render accordion open and show the last exported date', async () => {
    const { getByText, queryByText } = render(
      <Components expandedPanel={label} />,
    );

    expect(getByText(descriptionText)).toBeInTheDocument();
    expect(
      queryByText('Your last export was on Jan 6, 2024, 2:34 AM UTC'),
    ).toBeInTheDocument();
  });

  it('should default the submit button to disabled unless the box is checked', async () => {
    const { getByRole } = render(<Components expandedPanel={label} />);
    const input = getByRole('checkbox');
    const button = getByRole('button', { name: 'Download All Data' });

    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    userEvent.click(input);

    await waitFor(() => {
      expect(input).toBeChecked();
      expect(button).not.toBeDisabled();
    });
  });
});
