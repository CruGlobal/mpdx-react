import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ThemeProvider } from '@material-ui/styles';
import { ContactsQuery } from '../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import theme from '../../../../src/theme';
import { ContactFilterStatusEnum } from '../../../../graphql/types.generated';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactFlowColumn } from './ContactFlowColumn';

const accountListId = 'abc';
const title = 'Test Column';
const onContactSelected = jest.fn();
const contact = { id: '123', name: 'Test Person' };

describe('ContactFlowColumn', () => {
  it('should render a column with correct details', async () => {
    const { getByText, getByTestId } = render(
      <DndProvider backend={HTML5Backend}>
        <ThemeProvider theme={theme}>
          <TestWrapper>
            <GqlMockedProvider<ContactsQuery>
              mocks={{
                Contacts: {
                  contacts: {
                    nodes: [contact],
                    pageInfo: { endCursor: 'Mg', hasNextPage: false },
                    totalCount: 1,
                  },
                },
              }}
            >
              <ContactFlowColumn
                accountListId={accountListId}
                color={theme.palette.mpdxBlue.main}
                title={title}
                onContactSelected={onContactSelected}
                statuses={[ContactFilterStatusEnum.PartnerFinancial]}
              />
            </GqlMockedProvider>
          </TestWrapper>
        </ThemeProvider>
      </DndProvider>,
    );
    await waitFor(() => expect(getByText(title)).toBeInTheDocument());
    expect(getByText('1')).toBeInTheDocument();
    expect(getByTestId('column-header')).toHaveStyle({
      backgroundColor: 'theme.palette.mpdxBlue.main',
    });
  });
});
