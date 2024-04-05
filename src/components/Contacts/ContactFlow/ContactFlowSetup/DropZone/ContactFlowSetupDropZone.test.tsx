import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TestRouter from '__tests__/util/TestRouter';
import { ContactFilterStatusEnum } from 'src/graphql/types.generated';
import theme from '../../../../../theme';
import { ContactFlowSetupColumn } from '../Column/ContactFlowSetupColumn';

const accountListId = 'abc';
const title = 'Test Column';
const status = [
  {
    id: 'APPOINTMENT_SCHEDULED' as ContactFilterStatusEnum,
    value: 'Appointment Scheduled',
  },
  {
    id: 'PARTNER_FINANCIAL' as ContactFilterStatusEnum,
    value: 'Partner - Financial',
  },
];

const statusTwo = [
  {
    id: 'NOT_INTERESTED' as ContactFilterStatusEnum,
    value: 'Not Interested',
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

interface flowOptionsArray {
  name: string;
  statuses: string[];
  color: string;
  id: string;
}
[];

const flowOptions: flowOptionsArray[] = [
  {
    name: 'Untitled Two',
    id: '6ced166a-d570-4086-af56-e3eeed8a1f98',
    statuses: [
      'Appointment Scheduled',
      'Not Interested',
      'Partner - Financial',
    ],
    color: 'color-text',
  },
  {
    name: 'Untitled',
    id: '8a6bc2ed-820e-437b-81b8-36fbbe91f5e3',
    statuses: ['Partner - Pray', 'Never Ask'],
    color: 'color-info',
  },
];

describe('ContactFlowSetupDropZone', () => {
  it('Test Drag and Drop of status', async () => {
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
                flowOptions={flowOptions}
              />
              <ContactFlowSetupColumn
                index={1}
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
                statuses={statusTwo}
                updateColumns={updateColumns}
                flowOptions={flowOptions}
              />
            </TestRouter>
          </ThemeProvider>
        </DndProvider>
      </SnackbarProvider>,
    );

    const statusBox = getByTestId('APPOINTMENT_SCHEDULED');
    const statusDropZone = getByTestId('ContactFlowSetupDropZone-1');

    await waitFor(() => expect(statusBox).toBeInTheDocument());
    await waitFor(() =>
      expect(getByTestId('NOT_INTERESTED')).toBeInTheDocument(),
    );

    await waitFor(() => expect(statusDropZone).toBeInTheDocument());

    fireEvent.dragStart(statusBox);
    fireEvent.dragEnter(statusDropZone);
    fireEvent.dragOver(statusDropZone);
    fireEvent.drop(statusDropZone);
    await waitFor(() => expect(moveStatus).toHaveBeenCalled());
  });
});
