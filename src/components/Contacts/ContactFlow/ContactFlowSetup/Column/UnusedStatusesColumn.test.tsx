import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TestRouter from '../../../../../../__tests__/util/TestRouter';
import { ContactFilterStatusEnum } from '../../../../../../graphql/types.generated';
import theme from '../../../../../theme';
import { UnusedStatusesColumn } from './UnusedStatusesColumn';

const accountListId = 'abc';
const status = [
  {
    id: 'PARTNER_FINANCIAL' as ContactFilterStatusEnum,
    value: 'Partner - Financial',
  },
];
const router = {
  query: { accountListId },
  isReady: true,
};

const moveStatus = jest.fn();

describe('UnusedStatusesColumn', () => {
  it('should render a column with correct details', async () => {
    const { getByTestId, getByText } = render(
      <SnackbarProvider>
        <DndProvider backend={HTML5Backend}>
          <ThemeProvider theme={theme}>
            <TestRouter router={router}>
              <UnusedStatusesColumn
                accountListId={accountListId}
                loading={false}
                columnWidth={100}
                statuses={status}
                moveStatus={moveStatus}
              />
            </TestRouter>
          </ThemeProvider>
        </DndProvider>
      </SnackbarProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('column-header')).toHaveStyle({
        borderBottom: `5px solid ${theme.palette.cruGrayMedium.main}`,
      }),
    );
    expect(getByText('Unused Statuses')).toBeInTheDocument();
  });
});
