import { ThemeProvider } from '@mui/material/styles';
import { act, render } from '@testing-library/react';
import { useSnackbar } from 'notistack';
import matchMediaMock from '__tests__/util/matchMediaMock';
import theme from 'src/theme';
import { AppSnackbarProvider } from './AppSnackbarProvider';

let enqueue: ReturnType<typeof useSnackbar>['enqueueSnackbar'];

const SnackbarGrabber: React.FC = () => {
  enqueue = useSnackbar().enqueueSnackbar;
  return null;
};

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <AppSnackbarProvider>
      <SnackbarGrabber />
    </AppSnackbarProvider>
  </ThemeProvider>
);

const showToasts = (...messages: string[]) => {
  act(() => {
    messages.forEach((message) => enqueue(message, { variant: 'error' }));
  });
};

describe('AppSnackbarProvider', () => {
  it('shows a repeated message only once', () => {
    matchMediaMock({ width: '1024px' });
    const { getAllByText } = render(<TestComponent />);

    showToasts('Staff account not found', 'Staff account not found');

    expect(getAllByText('Staff account not found')).toHaveLength(1);
  });

  it('shows up to three toasts at the bottom on desktop', () => {
    matchMediaMock({ width: '1024px' });
    const { getByText } = render(<TestComponent />);

    showToasts('Error 1', 'Error 2', 'Error 3');

    expect(getByText('Error 1')).toBeInTheDocument();
    expect(getByText('Error 2')).toBeInTheDocument();
    expect(getByText('Error 3')).toBeInTheDocument();
    expect(getByText('Error 3').closest('.SnackbarContainer-root')).toHaveClass(
      'SnackbarContainer-bottom',
      'SnackbarContainer-left',
    );
  });

  it('shows at most two toasts at the top on phones', () => {
    matchMediaMock({ width: '390px' });
    const { getByText, queryByText } = render(<TestComponent />);

    showToasts('Error 1', 'Error 2', 'Error 3');

    expect(queryByText('Error 3')).not.toBeInTheDocument();
    expect(getByText('Error 2').closest('.SnackbarContainer-root')).toHaveClass(
      'SnackbarContainer-top',
      'SnackbarContainer-center',
    );
  });
});
