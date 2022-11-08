import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import userEvent from '@testing-library/user-event';
import TestRouter from '../../../../../../__tests__/util/TestRouter';
import theme from '../../../../../../src/theme';
import { ContactFilterStatusEnum } from '../../../../../../graphql/types.generated';
import { ContactFlowSetupColumn } from './ContactFlowSetupColumn';

const accountListId = 'abc';
const title = 'Test Column';
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

const changeColor = jest.fn();
const changeTitle = jest.fn();
const deleteColumn = jest.fn();
const moveStatus = jest.fn();
const setColumnWidth = jest.fn();
const moveColumns = jest.fn();
const updateColumns = jest.fn();

describe('ContactFlowSetupColumn', () => {
  it('should render a column with correct details', async () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <DndProvider backend={HTML5Backend}>
          <ThemeProvider theme={theme}>
            <TestRouter router={router}>
              <ContactFlowSetupColumn
                index={0}
                accountListId={accountListId}
                color={theme.palette.mpdxBlue.main}
                title={title}
                changeColor={changeColor}
                changeTitle={changeTitle}
                deleteColumn={deleteColumn}
                moveStatus={moveStatus}
                moveColumns={moveColumns}
                loading={false}
                columnWidth={100}
                setColumnWidth={setColumnWidth}
                statuses={status}
                updateColumns={updateColumns}
              />
            </TestRouter>
          </ThemeProvider>
        </DndProvider>
      </SnackbarProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('column-header')).toHaveStyle({
        borderBottom: '5px solid theme.palette.mpdxBlue.main',
      }),
    );
    const columnTitle = getByTestId('column-title') as HTMLInputElement;
    expect(columnTitle.value).toBe(title);
    userEvent.type(columnTitle, 'additional text');
    expect(columnTitle.value).toBe(title + 'additional text');
  });

  it('should change attempt to change the color', async () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <DndProvider backend={HTML5Backend}>
          <ThemeProvider theme={theme}>
            <TestRouter router={router}>
              <ContactFlowSetupColumn
                index={0}
                accountListId={accountListId}
                color={theme.palette.mpdxBlue.main}
                title={title}
                changeColor={changeColor}
                changeTitle={changeTitle}
                deleteColumn={deleteColumn}
                loading={false}
                columnWidth={100}
                setColumnWidth={setColumnWidth}
                moveStatus={moveStatus}
                moveColumns={moveColumns}
                statuses={status}
                updateColumns={updateColumns}
              />
            </TestRouter>
          </ThemeProvider>
        </DndProvider>
      </SnackbarProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('color-selector-box')).toBeInTheDocument(),
    );
    const redButton = getByTestId('colorButton-color-danger');
    userEvent.click(redButton);
    expect(changeColor).toHaveBeenCalledWith(0, 'color-danger');
    const yellowButton = getByTestId('colorButton-color-warning');
    userEvent.click(yellowButton);
    expect(changeColor).toHaveBeenCalledWith(0, 'color-warning');
    const greenButton = getByTestId('colorButton-color-success');
    userEvent.click(greenButton);
    expect(changeColor).toHaveBeenCalledWith(0, 'color-success');
    const blueButton = getByTestId('colorButton-color-info');
    userEvent.click(blueButton);
    expect(changeColor).toHaveBeenCalledWith(0, 'color-info');
    const grayButton = getByTestId('colorButton-color-text');
    userEvent.click(grayButton);
    expect(changeColor).toHaveBeenCalledWith(0, 'color-text');
  });

  it('should call the delete function', async () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <DndProvider backend={HTML5Backend}>
          <ThemeProvider theme={theme}>
            <TestRouter router={router}>
              <ContactFlowSetupColumn
                index={0}
                accountListId={accountListId}
                color={theme.palette.mpdxBlue.main}
                title={title}
                changeColor={changeColor}
                changeTitle={changeTitle}
                deleteColumn={deleteColumn}
                loading={false}
                columnWidth={100}
                setColumnWidth={setColumnWidth}
                moveStatus={moveStatus}
                moveColumns={moveColumns}
                statuses={status}
                updateColumns={updateColumns}
              />
            </TestRouter>
          </ThemeProvider>
        </DndProvider>
      </SnackbarProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('delete-column-button')).toBeInTheDocument(),
    );
    userEvent.click(getByTestId('delete-column-button'));
    expect(deleteColumn).toHaveBeenCalledWith(0);
  });
});
