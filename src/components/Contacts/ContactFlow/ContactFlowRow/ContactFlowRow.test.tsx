import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TestWrapper from '__tests__/util/TestWrapper';
import { PhaseEnum, StatusEnum } from 'src/graphql/types.generated';
import theme from '../../../../theme';
import { ContactRowFragment } from '../../ContactRow/ContactRow.generated';
import { ContactFlowRow } from './ContactFlowRow';

const accountListId = 'abc';
const status = StatusEnum.PartnerFinancial;
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

describe('ContactFlowRow', () => {
  it('should display contact name and status', () => {
    const { getByText, getByTitle } = render(
      <DndProvider backend={HTML5Backend}>
        <ThemeProvider theme={theme}>
          <TestWrapper>
            <ContactFlowRow
              accountListId={accountListId}
              contact={contact}
              status={status}
              contactPhase={PhaseEnum.PartnerCare}
              onContactSelected={onContactSelected}
            />
          </TestWrapper>
        </ThemeProvider>
      </DndProvider>,
    );
    expect(getByText('Test Name')).toBeInTheDocument();
    expect(getByTitle('Unstar')).toBeInTheDocument();
  });

  it('should call contact selected function', () => {
    const { getByText } = render(
      <DndProvider backend={HTML5Backend}>
        <ThemeProvider theme={theme}>
          <TestWrapper>
            <ContactFlowRow
              accountListId={accountListId}
              contact={contact}
              status={status}
              contactPhase={PhaseEnum.PartnerCare}
              onContactSelected={onContactSelected}
            />
          </TestWrapper>
        </ThemeProvider>
      </DndProvider>,
    );
    userEvent.click(getByText('Test Name'));
    expect(getByText('Test Name')).toBeInTheDocument();
    expect(onContactSelected).toHaveBeenCalledWith('123', true, true);
  });
});
