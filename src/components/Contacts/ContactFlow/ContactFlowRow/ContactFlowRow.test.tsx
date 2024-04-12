import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { StatusEnum } from 'src/graphql/types.generated';
import TestWrapper from '../../../../../__tests__/util/TestWrapper';
import theme from '../../../../theme';
import { ContactFlowRow } from './ContactFlowRow';

const accountListId = 'abc';
const id = '123';
const name = 'Test Name';
const status = {
  id: StatusEnum.PartnerFinancial,
  value: 'Partner - Financial',
};
const pathname = `/pathname/contacts/flow/${id}`;
const getContactUrl = jest.fn().mockReturnValue({
  pathname: pathname,
  query: { filters: 'filterOptions' },
  contactUrl: `${pathname}?filters=filterOptions`,
});

describe('ContactFlowRow', () => {
  beforeEach(() => {
    getContactUrl.mockClear();
  });

  it('should display contact name and status', () => {
    const { getByText, getByTitle } = render(
      <DndProvider backend={HTML5Backend}>
        <ThemeProvider theme={theme}>
          <TestWrapper>
            <ContactFlowRow
              accountListId={accountListId}
              id={id}
              name={name}
              status={status}
              starred
              getContactUrl={getContactUrl}
            />
          </TestWrapper>
        </ThemeProvider>
      </DndProvider>,
    );
    expect(getByText('Test Name')).toBeInTheDocument();
    expect(getByTitle('Filled Star Icon')).toBeInTheDocument();
  });

  it('should render the contact <a> correctly', () => {
    const { getByRole } = render(
      <DndProvider backend={HTML5Backend}>
        <ThemeProvider theme={theme}>
          <TestWrapper>
            <ContactFlowRow
              accountListId={accountListId}
              id={id}
              name={name}
              status={status}
              starred
              getContactUrl={getContactUrl}
            />
          </TestWrapper>
        </ThemeProvider>
      </DndProvider>,
    );
    const contactLink = getByRole('link', {
      name: 'Test Name',
    });

    expect(getContactUrl).toHaveBeenCalledWith(id);

    expect(contactLink).toHaveAttribute(
      'href',
      `${pathname}?filters=filterOptions`,
    );
  });
});
