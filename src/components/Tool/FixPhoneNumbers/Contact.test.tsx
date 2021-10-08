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
      updatedAt: '2019-12-03',
      number: '3533895895',
      primary: true,
      source: 'MPDX',
    },
    {
      id: '1234',
      updatedAt: '2019-12-04',
      number: '623533895895',
      primary: false,
      source: 'MPDX',
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
            personId={testData.id}
            numbers={testData.numbers}
            toDelete={[]}
            handleChange={handleChangeMock}
            handleDelete={handleDeleteModalOpenMock}
            handleAdd={handleAddMock}
            handleChangePrimary={handleChangePrimaryMock}
          />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(getByText(testData.name)).toBeInTheDocument();
    expect(getByTestId('textfield-testid-0')).toBeInTheDocument();
    expect(getByDisplayValue('3533895895')).toBeInTheDocument();
    expect(getByTestId('textfield-testid-1')).toBeInTheDocument();
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
            personId={testData.id}
            numbers={testData.numbers}
            toDelete={[]}
            handleChange={handleChangeMock}
            handleDelete={handleDeleteModalOpenMock}
            handleAdd={handleAddMock}
            handleChangePrimary={handleChangePrimaryMock}
          />
        </TestWrapper>
      </ThemeProvider>,
    );

    const addInput = getByTestId(
      'addNewNumberInput-testid',
    ) as HTMLInputElement;
    const addButton = getByTestId('addButton-testid');

    userEvent.type(addInput, '123');
    expect(addInput.value).toBe('123');
    userEvent.click(addButton);
    expect(addInput.value).toBe('');
  });

  it('should call mock functions', () => {
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
            personId={testData.id}
            numbers={testData.numbers}
            toDelete={[]}
            handleChange={handleChangeMock}
            handleDelete={handleDeleteModalOpenMock}
            handleAdd={handleAddMock}
            handleChangePrimary={handleChangePrimaryMock}
          />
        </TestWrapper>
      </ThemeProvider>,
    );

    const firstInput = getByTestId('textfield-testid-0') as HTMLInputElement;
    expect(firstInput.value).toBe('3533895895');
    userEvent.type(firstInput, '123');
    expect(handleChangeMock).toHaveBeenCalled();
    userEvent.click(getByTestId('starOutlineIcon-testid-1'));
    expect(handleChangePrimaryMock).toHaveBeenCalled();
    userEvent.click(getByTestId('delete-testid-1'));
    expect(handleDeleteModalOpenMock).toHaveBeenCalled();
  });
});
