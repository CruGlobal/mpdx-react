import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import theme from 'src/theme';
import {
  AppealStatusEnum,
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { AppealsListFilterPanel } from './AppealsListFilterPanel';
import { ContactsCountQuery } from './contactsCount.generated';

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

const Components = ({ ids = selectedIds }) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
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
              } as unknown as AppealsType
            }
          >
            <AppealsListFilterPanel onClose={onClose} />
          </AppealsContext.Provider>
        </AppealsWrapper>
      </GqlMockedProvider>
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
    const { getByText, getByRole, getAllByRole } = render(<Components />);

    expect(getByText('Given')).toBeInTheDocument();
    expect(getByText('Committed')).toBeInTheDocument();
    expect(getByText('Excluded')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByRole('button', { name: /given 5/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /received 5/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /asked 5/i })).toBeInTheDocument();
    });

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
  });
});
