import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { ActionTypeEnum, StatusEnum, mockData } from '../mockData';
import { DeleteTransferModal } from './DeleteTransferModal';

const mutationSpy = jest.fn();
const handleClose = jest.fn();
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

const mockTransfer = {
  ...mockData[0],
  status: StatusEnum.Ongoing,
};

interface TestComponentProps {
  type?: ActionTypeEnum;
  mocks?: ApolloErgonoMockMap;
}

const TestComponent: React.FC<TestComponentProps> = ({
  type = ActionTypeEnum.Stop,
  mocks,
}) => {
  return (
    <SnackbarProvider>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider mocks={mocks} onCall={mutationSpy}>
            <DeleteTransferModal
              handleClose={handleClose}
              transfer={mockTransfer}
              type={type}
            />
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </SnackbarProvider>
  );
};

describe('DeleteTransferModal', () => {
  it('renders the modal', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('Stop Transfer')).toBeInTheDocument();
    expect(
      getByText('Are you sure you want to stop this recurring transfer?'),
    ).toBeInTheDocument();
  });

  it('renders the cancel wording when the type is cancel', () => {
    const { getByText } = render(
      <TestComponent type={ActionTypeEnum.Cancel} />,
    );

    expect(getByText('Cancel Transfer')).toBeInTheDocument();
    expect(
      getByText('Are you sure you want to cancel this recurring transfer?'),
    ).toBeInTheDocument();
  });

  it('renders snackbar on delete success', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Yes' }));
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Transfer stopped successfully',
        { variant: 'success' },
      );
    });
    expect(handleClose).toHaveBeenCalled();
  });

  it('renders error snackbar and stays open on delete failure', async () => {
    const { getByRole } = render(
      <TestComponent
        mocks={{
          DeleteRecurringTransfer: {
            deleteRecurringTransfer: () => {
              throw new GraphQLError('Transfer not found');
            },
          },
        }}
      />,
    );

    userEvent.click(getByRole('button', { name: 'Yes' }));
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith('Failed to stop transfer', {
        variant: 'error',
      });
    });
    expect(mockEnqueue).not.toHaveBeenCalledWith(
      'Transfer stopped successfully',
      expect.anything(),
    );
    expect(handleClose).not.toHaveBeenCalled();
    expect(getByRole('button', { name: 'Yes' })).not.toBeDisabled();
  });
});
