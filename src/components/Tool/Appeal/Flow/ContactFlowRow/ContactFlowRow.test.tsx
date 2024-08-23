import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TestWrapper from '__tests__/util/TestWrapper';
import { ContactRowFragment } from 'src/components/Contacts/ContactRow/ContactRow.generated';
import theme from 'src/theme';
import {
  AppealStatusEnum,
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { ContactFlowRow } from './ContactFlowRow';

const accountListId = 'abc';
const contact = {
  id: '123',
  name: 'Test Name',
  starred: true,
  avatar: 'avatar.jpg',
  pledgeAmount: 100,
  pledgeCurrency: 'USD',
  pledgeReceived: false,
  uncompletedTasksCount: 0,
} as ContactRowFragment;
const onContactSelected = jest.fn();
const toggleSelectionById = jest.fn();
const isChecked = jest.fn().mockImplementation(() => false);

const Components = () => (
  <DndProvider backend={HTML5Backend}>
    <ThemeProvider theme={theme}>
      <TestWrapper>
        <AppealsContext.Provider
          value={
            {
              isRowChecked: isChecked,
              toggleSelectionById,
            } as unknown as AppealsType
          }
        >
          <ContactFlowRow
            accountListId={accountListId}
            contact={contact}
            appealStatus={AppealStatusEnum.Processed}
            onContactSelected={onContactSelected}
          />
        </AppealsContext.Provider>
      </TestWrapper>
    </ThemeProvider>
  </DndProvider>
);

describe('ContactFlowRow', () => {
  it('should display contact name and status', () => {
    const { getByText, getByTitle } = render(<Components />);
    expect(getByText('Test Name')).toBeInTheDocument();
    expect(getByTitle('Filled Star Icon')).toBeInTheDocument();
  });

  it('should call contact selected function', () => {
    const { getByText } = render(<Components />);
    userEvent.click(getByText('Test Name'));
    expect(getByText('Test Name')).toBeInTheDocument();
    expect(onContactSelected).toHaveBeenCalledWith('123', true, true);
  });

  it('should call check contact', async () => {
    const { getByRole } = render(<Components />);

    userEvent.click(getByRole('checkbox'));
    await waitFor(() => {
      expect(toggleSelectionById).toHaveBeenLastCalledWith(contact.id);
    });
  });
});
