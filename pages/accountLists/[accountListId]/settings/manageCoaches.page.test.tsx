import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import ManageCoaching from './manageCoaches.page';

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

const Components = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider>
        <SnackbarProvider>
          <ManageCoaching />
        </SnackbarProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('ManageCoaching', () => {
  it('should open Coaching Access accordion', async () => {
    const { getAllByText } = render(<Components />);
    await waitFor(() => {
      expect(getAllByText('Manage Account Coaching Access').length).toEqual(2);
    });
  });
});
