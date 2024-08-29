import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import theme from 'src/theme';
import {
  AppealStatusEnum,
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { ContactsCountQuery } from '../../AppealsContext/contactsCount.generated';
import { AppealsListFilterPanel } from './AppealsListFilterPanel';

const accountListId = 'accountListId';
const appealId = 'appealId';
const activeFilters = { status: [AppealStatusEnum.Asked] };
const selectedIds = ['1', '2'];
const router = {
  query: { accountListId, appealId: ['1', 'list'] },
  isReady: true,
};
const onClose = jest.fn();
const setActiveFilters = jest.fn();
const deselectAll = jest.fn();

const defaultContactCountMock = {
  data: {
    contacts: {
      totalCount: 5,
    },
  },
  loading: false,
};

const Components = ({ ids = selectedIds }) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <SnackbarProvider>
        <GqlMockedProvider<{ ContactsCount: ContactsCountQuery }>
          mocks={{
            ContactsCount: {
              contacts: {
                totalCount: 5,
              },
            },
          }}
        >
          <AppealsWrapper>
            <AppealsContext.Provider
              value={
                {
                  accountListId,
                  appealId,
                  activeFilters,
                  selectedIds: ids,
                  setActiveFilters,
                  deselectAll,
                  askedCountQueryResult: defaultContactCountMock,
                  excludedCountQueryResult: defaultContactCountMock,
                  committedCountQueryResult: defaultContactCountMock,
                  givenCountQueryResult: defaultContactCountMock,
                  receivedCountQueryResult: defaultContactCountMock,
                } as unknown as AppealsType
              }
            >
              <AppealsListFilterPanel onClose={onClose} />
            </AppealsContext.Provider>
          </AppealsWrapper>
        </GqlMockedProvider>
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('AppealsListFilterPanel', () => {
  beforeEach(() => {
    onClose.mockClear();
  });

  it('should disable the button if no contacts are selected', async () => {
    const { getAllByRole } = render(<Components ids={[]} />);

    expect(
      getAllByRole('button', { name: 'Export 0 Selected' })[0],
    ).toBeDisabled();
    expect(
      getAllByRole('button', { name: 'Export 0 Selected' })[1],
    ).toBeDisabled();
  });

  it('default', async () => {
    const { getByText, getByRole, findByRole, getAllByRole } = render(
      <Components />,
    );

    expect(getByText('Given')).toBeInTheDocument();
    expect(getByText('Committed')).toBeInTheDocument();
    expect(getByText('Excluded')).toBeInTheDocument();

    expect(
      await findByRole('button', { name: /given 5/i }),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: /received 5/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /asked 5/i })).toBeInTheDocument();

    expect(getByText('Add Contact to Appeal')).toBeInTheDocument();
    expect(getByText('Delete Appeal')).toBeInTheDocument();

    expect(
      getAllByRole('button', { name: 'Export 2 Selected' })[0],
    ).toBeInTheDocument();
    expect(
      getAllByRole('button', { name: 'Export 2 Selected' })[1],
    ).not.toBeDisabled();
    expect(getByRole('button', { name: 'Select Contact' })).toBeInTheDocument();
  });

  it('should filter contacts on appeal status', async () => {
    const { getByText } = render(<Components />);

    expect(deselectAll).not.toHaveBeenCalled();
    expect(setActiveFilters).not.toHaveBeenCalled();

    userEvent.click(getByText('Given'));
    expect(deselectAll).toHaveBeenCalled();
    expect(setActiveFilters).toHaveBeenCalledWith({
      ...activeFilters,
      appealStatus: AppealStatusEnum.Processed,
    });

    userEvent.click(getByText('Received'));
    expect(deselectAll).toHaveBeenCalled();
    expect(setActiveFilters).toHaveBeenCalledWith({
      ...activeFilters,
      appealStatus: AppealStatusEnum.ReceivedNotProcessed,
    });

    userEvent.click(getByText('Committed'));
    expect(deselectAll).toHaveBeenCalled();
    expect(setActiveFilters).toHaveBeenCalledWith({
      ...activeFilters,
      appealStatus: AppealStatusEnum.NotReceived,
    });

    userEvent.click(getByText('Asked'));
    expect(deselectAll).toHaveBeenCalled();
    expect(setActiveFilters).toHaveBeenCalledWith({
      ...activeFilters,
      appealStatus: AppealStatusEnum.Asked,
    });

    userEvent.click(getByText('Excluded'));
    expect(deselectAll).toHaveBeenCalled();
    expect(setActiveFilters).toHaveBeenCalledWith({
      ...activeFilters,
      appealStatus: AppealStatusEnum.Excluded,
    });
  });

  describe('Modals', () => {
    it('should open export contacts modal', async () => {
      const { findAllByRole, findByRole } = render(<Components />);

      const buttons = await findAllByRole('button', {
        name: 'Export 2 Selected',
      });
      userEvent.click(buttons[0]);

      expect(
        await findByRole('heading', { name: 'Export Contacts' }),
      ).toBeInTheDocument();
    });

    it('should open export emails modal', async () => {
      const { findAllByRole, findByTestId } = render(<Components />);

      const buttons = await findAllByRole('button', {
        name: 'Export 2 Selected',
      });
      userEvent.click(buttons[1]);

      expect(await findByTestId('ExportEmailsModal')).toBeInTheDocument();
    });

    it('should open add contact to appeal modal', async () => {
      const { findByRole, findByTestId } = render(<Components />);

      const button = await findByRole('button', {
        name: 'Select Contact',
      });
      userEvent.click(button);

      expect(await findByTestId('addContactToAppealModal')).toBeInTheDocument();
    });

    it('should open delete appeal modal', async () => {
      const { findByRole, findByTestId } = render(<Components />);

      const button = await findByRole('button', {
        name: 'Permanently Delete Appeal',
      });
      userEvent.click(button);

      expect(await findByTestId('deleteAppealModal')).toBeInTheDocument();
    });
  });
});
