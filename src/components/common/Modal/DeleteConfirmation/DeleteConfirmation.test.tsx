import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { DeleteConfirmation } from './DeleteConfirmation';
import theme from 'src/theme';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';

const onClickConfirm = jest.fn();
const onClickDecline = jest.fn();

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

describe('DeleteConfirmation', () => {
  it('should do basic rendering', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <DeleteConfirmation
            open={true}
            deleting={false}
            deleteType={'person'}
            onClickConfirm={onClickConfirm}
            onClickDecline={onClickDecline}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() => expect(getByText('Confirm')).toBeInTheDocument());

    expect(getByText('No')).toBeInTheDocument();
    expect(getByText('Yes')).toBeInTheDocument();
  });

  it('should call the onClick function for declining', async () => {
    const { getByText, getByRole } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <DeleteConfirmation
            open={true}
            deleting={false}
            deleteType={'person'}
            onClickConfirm={onClickConfirm}
            onClickDecline={onClickDecline}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() => expect(getByText('No')).toBeInTheDocument());
    userEvent.click(getByRole('button', { name: 'No' }));
    expect(onClickDecline).toHaveBeenCalled();
  });

  it('should call the onClick function for confirming', async () => {
    const { getByText, getByRole } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <DeleteConfirmation
            open={true}
            deleting={false}
            deleteType={'person'}
            onClickConfirm={onClickConfirm}
            onClickDecline={onClickDecline}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() => expect(getByText('Yes')).toBeInTheDocument());
    userEvent.click(getByRole('button', { name: 'Yes' }));
    expect(onClickConfirm).toHaveBeenCalled();
  });
});
