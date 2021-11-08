import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ThemeProvider } from '@material-ui/styles';
import { SnackbarProvider } from 'notistack';
import TestRouter from '../../../../../../__tests__/util/TestRouter';
import theme from '../../../../../../src/theme';
import { ContactFilterStatusEnum } from '../../../../../../graphql/types.generated';
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
