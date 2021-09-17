import { ThemeProvider } from '@material-ui/core';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import theme from '../../../theme';
import Contact from './Contact';

const testData = {
  name: 'Test Contact',
  id: 'testid',
  numbers: [
    {
      id: '123',
      updatedAt: new Date('2019-12-03T03:40:05-06:00').toISOString(),
      number: '3533895895',
      primary: true,
    },
    {
      id: '1234',
      updatedAt: new Date('2019-12-04T03:40:05-06:00').toISOString(),
      number: '623533895895',
      primary: false,
    },
  ],
};

describe('FixPhoneNumbers-Contact', () => {
  it('default', () => {
    const handleChangeMock = jest.fn();
    const handleDeleteModalOpenMock = jest.fn();
    const handleAddMock = jest.fn();
    const handleChangePrimaryMock = jest.fn();

    const { getByText, getByTestId, getByDisplayValue } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <Contact
            name={testData.name}
            key={testData.name}
            contactIndex={0}
            numbers={testData.numbers}
            handleChange={handleChangeMock}
            handleDelete={handleDeleteModalOpenMock}
            handleAdd={handleAddMock}
            handleChangePrimary={handleChangePrimaryMock}
          />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(getByText(testData.name)).toBeInTheDocument();
    //expect(getByText('Source (2019-12-03)')).toBeInTheDocument();
    expect(getByTestId('textfield-0-0')).toBeInTheDocument();
    expect(getByDisplayValue('3533895895')).toBeInTheDocument();
    //expect(getByText('Source (2019-12-04)')).toBeInTheDocument();
    expect(getByTestId('textfield-0-1')).toBeInTheDocument();
    expect(getByDisplayValue('623533895895')).toBeInTheDocument();
  });

  it('input reset after adding an email address', () => {
    const handleChangeMock = jest.fn();
    const handleDeleteModalOpenMock = jest.fn();
    const handleAddMock = jest.fn();
    const handleChangePrimaryMock = jest.fn();

    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <Contact
            name={testData.name}
            key={testData.name}
            contactIndex={0}
            numbers={testData.numbers}
            handleChange={handleChangeMock}
            handleDelete={handleDeleteModalOpenMock}
            handleAdd={handleAddMock}
            handleChangePrimary={handleChangePrimaryMock}
          />
        </TestWrapper>
      </ThemeProvider>,
    );

    const addInput = getByTestId('addNewNumberInput-0') as HTMLInputElement;
    const addButton = getByTestId('addButton-0');

    userEvent.type(addInput, '123');
    expect(addInput.value).toBe('123');
    userEvent.click(addButton);
    expect(addInput.value).toBe('');
  });
});
