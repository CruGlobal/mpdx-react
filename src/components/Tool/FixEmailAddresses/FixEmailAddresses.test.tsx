import { ThemeProvider } from '@material-ui/core';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import theme from '../../../theme';
import FixEmailAddresses from './FixEmailAddreses';

const accountListId = 'test121';

describe('FixEmailAddresses-Home', () => {
  it('default with test data', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <FixEmailAddresses accountListId={accountListId} />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(getByText('Fix Email Addresses')).toBeInTheDocument();
    expect(
      getByText('You have 2 email addresses to confirm.'),
    ).toBeInTheDocument();
    expect(getByText('Confirm 2 as MPDX')).toBeInTheDocument();
    expect(getByText('Test Contact')).toBeInTheDocument();
    expect(getByText('Simba Lion')).toBeInTheDocument();
    expect(getByTestId('textfield-0-0')).toBeInTheDocument();
    expect(getByTestId('starIcon-0-0')).toBeInTheDocument();
  });

  it('change test data', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <FixEmailAddresses accountListId={accountListId} />
        </TestWrapper>
      </ThemeProvider>,
    );

    const button = getByTestId('changeTestData');
    userEvent.click(button);

    expect(
      getByText('No people with email addresses need attention'),
    ).toBeInTheDocument();
    expect(
      getByText(
        'People with new email addresses or multiple primary email addresses will appear here.',
      ),
    ).toBeInTheDocument();
  });

  it('change primary of first email', () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <FixEmailAddresses accountListId={accountListId} />
        </TestWrapper>
      </ThemeProvider>,
    );

    const star1 = getByTestId('starOutlineIcon-0-1');
    userEvent.click(star1);

    expect(queryByTestId('starIcon-0-0')).not.toBeInTheDocument();
    expect(getByTestId('starIcon-0-1')).toBeInTheDocument();
    expect(getByTestId('starOutlineIcon-0-0')).toBeInTheDocument();
  });

  it('delete third email from first person', () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <FixEmailAddresses accountListId={accountListId} />
        </TestWrapper>
      </ThemeProvider>,
    );

    const delete02 = getByTestId('delete-0-2');
    userEvent.click(delete02);

    const deleteButton = getByTestId('emailAddressDeleteButton');
    userEvent.click(deleteButton);

    expect(queryByTestId('textfield-0-2')).not.toBeInTheDocument();
  });

  it('change third email from first person', () => {
    const { getByDisplayValue } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <FixEmailAddresses accountListId={accountListId} />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(getByDisplayValue('test2@test1.com')).toBeInTheDocument();
    const textfield11 = getByDisplayValue(
      'test2@test1.com',
    ) as HTMLInputElement;
    userEvent.type(textfield11, 'a');

    expect(textfield11.value).toBe('test2@test1.coma');
  });

  it('change second email for second person to primary then delete it', () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <FixEmailAddresses accountListId={accountListId} />
        </TestWrapper>
      </ThemeProvider>,
    );

    const star11 = getByTestId('starOutlineIcon-1-1');
    userEvent.click(star11);

    const delete11 = getByTestId('delete-1-1');
    userEvent.click(delete11);

    const deleteButton = getByTestId('emailAddressDeleteButton');
    userEvent.click(deleteButton);

    expect(queryByTestId('starIcon-1-1')).not.toBeInTheDocument();
    expect(getByTestId('starIcon-1-0')).toBeInTheDocument();
  });

  it('add an email address to first person', () => {
    const { getByTestId, getByDisplayValue } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <FixEmailAddresses accountListId={accountListId} />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(getByTestId('starIcon-1-0')).toBeInTheDocument();
    expect(getByTestId('textfield-1-0')).toBeInTheDocument();

    const textfieldNew1 = getByTestId('addNewEmailInput-1') as HTMLInputElement;
    userEvent.type(textfieldNew1, 'a@a.com');
    const addButton1 = getByTestId('addButton-1');
    userEvent.click(addButton1);

    expect(textfieldNew1.value).toBe('');
    expect(getByTestId('textfield-1-1')).toBeInTheDocument();
    expect(getByDisplayValue('a@a.com')).toBeInTheDocument();
  });
});
