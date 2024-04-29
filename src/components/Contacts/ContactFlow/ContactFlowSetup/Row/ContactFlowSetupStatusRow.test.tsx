import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TestWrapper from '__tests__/util/TestWrapper';
import { ContactFilterStatusEnum } from 'src/graphql/types.generated';
import theme from '../../../../../theme';
import { ContactFlowSetupStatusRow } from './ContactFlowSetupStatusRow';

describe('ContactFlowSetupStatusRow', () => {
  it('should display status', () => {
    const { getByText } = render(
      <DndProvider backend={HTML5Backend}>
        <ThemeProvider theme={theme}>
          <TestWrapper>
            <ContactFlowSetupStatusRow
              columnWidth={100}
              columnIndex={0}
              status={{
                id: 'PARTNER_FINANCIAL' as ContactFilterStatusEnum,
                value: 'Partner - Financial',
              }}
            />
          </TestWrapper>
        </ThemeProvider>
      </DndProvider>,
    );
    expect(getByText('Partner - Financial')).toBeInTheDocument();
  });
});
