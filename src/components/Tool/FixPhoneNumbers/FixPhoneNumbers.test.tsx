import { ThemeProvider } from '@material-ui/core';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import theme from '../../../theme';
import FixPhoneNumbers from './FixPhoneNumbers';

describe('FixPhoneNumbers-Home', () => {
  it('default with test data', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <FixPhoneNumbers />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(getByText('Fix Phone Numbers')).toBeInTheDocument();
    expect(
      getByText('You have 2 phone numbers to confirm.'),
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
          <FixPhoneNumbers />
        </TestWrapper>
      </ThemeProvider>,
    );

    const button = getByTestId('changeTestData');
    userEvent.click(button);

    expect(
      getByText('No people with phone numbers need attention'),
    ).toBeInTheDocument();
    expect(
      getByText(
        'People with new phone numbers or multiple primary phone numbers will appear here.',
      ),
    ).toBeInTheDocument();
  });

  it('change primary of first number', () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <FixPhoneNumbers />
        </TestWrapper>
      </ThemeProvider>,
    );

    const star1 = getByTestId('starOutlineIcon-0-1');
    userEvent.click(star1);

    expect(queryByTestId('starIcon-0-0')).not.toBeInTheDocument();
    expect(getByTestId('starIcon-0-1')).toBeInTheDocument();
    expect(getByTestId('starOutlineIcon-0-0')).toBeInTheDocument();
  });

  it('delete third number from first person', () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <FixPhoneNumbers />
        </TestWrapper>
      </ThemeProvider>,
    );

    const delete02 = getByTestId('delete-0-2');
    userEvent.click(delete02);

    const deleteButton = getByTestId('phoneNumberDeleteButton');
    userEvent.click(deleteButton);

    expect(queryByTestId('textfield-0-2')).not.toBeInTheDocument();
  });

  it('change third number from second person', () => {
    const { getByDisplayValue } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <FixPhoneNumbers />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(getByDisplayValue('+623535785056')).toBeInTheDocument();
    const textfield11 = getByDisplayValue('+623535785056') as HTMLInputElement;
    userEvent.type(textfield11, '1');

    expect(textfield11.value).toBe('+6235357850561');
  });

  it('change second number for second person to primary then delete it', () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <FixPhoneNumbers />
        </TestWrapper>
      </ThemeProvider>,
    );

    const star11 = getByTestId('starOutlineIcon-1-1');
    userEvent.click(star11);

    const delete11 = getByTestId('delete-1-1');
    userEvent.click(delete11);

    const deleteButton = getByTestId('phoneNumberDeleteButton');
    userEvent.click(deleteButton);

    expect(queryByTestId('starIcon-1-1')).not.toBeInTheDocument();
    expect(getByTestId('starIcon-1-0')).toBeInTheDocument();
  });

  it('add a phone number to first person', () => {
    const { getByTestId, getByDisplayValue } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <FixPhoneNumbers />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(getByTestId('starIcon-1-0')).toBeInTheDocument();
    expect(getByTestId('textfield-1-0')).toBeInTheDocument();

    const textfieldNew1 = getByTestId(
      'addNewNumberInput-1',
    ) as HTMLInputElement;
    userEvent.type(textfieldNew1, '+12345');
    const addButton1 = getByTestId('addButton-1');
    userEvent.click(addButton1);

    expect(textfieldNew1.value).toBe('');
    expect(getByTestId('textfield-1-1')).toBeInTheDocument();
    expect(getByDisplayValue('+12345')).toBeInTheDocument();
  });
});
