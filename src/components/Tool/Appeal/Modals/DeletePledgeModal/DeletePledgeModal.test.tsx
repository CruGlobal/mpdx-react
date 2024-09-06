import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import { PledgeStatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import {
  AppealsContext,
  TableViewModeEnum,
} from '../../AppealsContext/AppealsContext';
import { DeletePledgeModal } from './DeletePledgeModal';

const accountListId = 'abc';
const appealId = 'appealId';
const router = {
  query: { accountListId },
  isReady: true,
};
const handleClose = jest.fn();
const mutationSpy = jest.fn();
const refetch = jest.fn();
const seRefreshFlowsView = jest.fn();
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

const pledge = {
  id: 'pledge-1',
  appeal: {
    id: appealId,
  },
  amount: 100,
  amountCurrency: 'USD',
  expectedDate: '2020-01-01',
  status: PledgeStatusEnum.NotReceived,
};
interface ComponentsProps {
  viewMode?: TableViewModeEnum;
}
const Components = ({ viewMode = TableViewModeEnum.List }: ComponentsProps) => (
  <I18nextProvider i18n={i18n}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider onCall={mutationSpy}>
              <AppealsWrapper>
                <AppealsContext.Provider
                  value={{
                    accountListId,
                    appealId: appealId,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    contactsQueryResult: { refetch },
                    viewMode,
                    seRefreshFlowsView,
                  }}
                >
                  <DeletePledgeModal
                    pledge={pledge}
                    handleClose={handleClose}
                  />
                </AppealsContext.Provider>
              </AppealsWrapper>
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>
    </LocalizationProvider>
  </I18nextProvider>
);

describe('DeletePledgeModal', () => {
  beforeEach(() => {
    handleClose.mockClear();
    refetch.mockClear();
  });
  it('default', async () => {
    const { getByRole } = render(<Components />);

    expect(
      getByRole('heading', { name: 'Remove Commitment' }),
    ).toBeInTheDocument();

    expect(getByRole('button', { name: 'No' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Yes' })).toBeInTheDocument();
  });

  it('should close modal', () => {
    const { getByRole } = render(<Components />);

    expect(handleClose).toHaveBeenCalledTimes(0);
    userEvent.click(getByRole('button', { name: 'No' }));
    expect(handleClose).toHaveBeenCalledTimes(1);

    userEvent.click(getByRole('button', { name: 'Close' }));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('should remove commitment', async () => {
    const { getByRole } = render(<Components />);

    expect(mutationSpy).toHaveBeenCalledTimes(0);

    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Successfully removed commitment from appeal',
        {
          variant: 'success',
        },
      );
    });

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('DeleteAccountListPledge', {
        input: {
          id: pledge.id,
        },
      });
    });

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(seRefreshFlowsView).not.toHaveBeenCalled();
  });

  it('should refetch flows columns if on the flows view', async () => {
    const { getByRole } = render(
      <Components viewMode={TableViewModeEnum.Flows} />,
    );

    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() => expect(seRefreshFlowsView).toHaveBeenCalledTimes(1));
    expect(refetch).not.toHaveBeenCalled();
  });
});
