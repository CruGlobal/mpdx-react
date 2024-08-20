import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import TestWrapper from '__tests__/util/TestWrapper';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import theme from '../../../theme';
import Contact from './Contact';

const testData = {
  name: 'Test Contact',
  firstName: 'Test',
  lastName: 'Contact',
  avatar: 'https://www.example.com',
  id: 'testid',
  isNewPhoneNumber: false,
  newPhoneNumber: '',
  phoneNumbers: {
    nodes: [
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
  },
};

const setContactFocus = jest.fn();
const handleDeleteModalOpenMock = jest.fn();
const updatePhoneNumber = jest.fn();
const setValuesMock = jest.fn();

const errors = {};

describe('FixPhoneNumbers-Contact', () => {
  it('default', () => {
    const { getByText, getByTestId, getByDisplayValue } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <Contact
            key={testData.id}
            person={testData}
            personIndex={0}
            handleDelete={handleDeleteModalOpenMock}
            setContactFocus={setContactFocus}
            handleUpdate={updatePhoneNumber}
            errors={errors}
            values={{ people: [testData] }}
            setValues={setValuesMock}
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

  it('input reset after adding an phone number', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <Contact
            key={testData.id}
            person={testData}
            personIndex={0}
            handleDelete={handleDeleteModalOpenMock}
            setContactFocus={setContactFocus}
            handleUpdate={updatePhoneNumber}
            errors={errors}
            values={{ people: [testData] }}
            setValues={setValuesMock}
          />
        </TestWrapper>
      </ThemeProvider>,
    );

    const addInput = getByTestId(
      'addNewNumberInput-testid',
    ) as HTMLInputElement;
    const addButton = getByTestId('addButton-testid');

    userEvent.type(addInput, '1');

    await waitFor(() => {
      expect(setValuesMock).toHaveBeenCalledWith({
        people: [
          {
            ...testData,
            isNewPhoneNumber: true,
            newPhoneNumber: '1',
          },
        ],
      });
    });

    userEvent.click(addButton);
    expect(addInput.value).toBe('');
  });

  it('should call mock functions', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <Contact
            key={testData.id}
            person={testData}
            personIndex={0}
            handleDelete={handleDeleteModalOpenMock}
            setContactFocus={setContactFocus}
            handleUpdate={updatePhoneNumber}
            errors={errors}
            values={{ people: [testData] }}
            setValues={setValuesMock}
          />
        </TestWrapper>
      </ThemeProvider>,
    );

    const firstInput = getByTestId('textfield-testid-0') as HTMLInputElement;
    expect(firstInput.value).toBe('3533895895');
    userEvent.type(firstInput, '1');

    await waitFor(() => {
      expect(setValuesMock).toHaveBeenCalledWith({
        people: [
          {
            ...testData,
            phoneNumbers: {
              nodes: [
                { ...testData.phoneNumbers.nodes[0], number: '35338958951' },
                { ...testData.phoneNumbers.nodes[1] },
              ],
            },
          },
        ],
      });
    });
    userEvent.click(getByTestId('delete-testid-1'));
    expect(handleDeleteModalOpenMock).toHaveBeenCalled();
    userEvent.click(getByTestId(`confirmButton-${testData.id}`));
    expect(updatePhoneNumber).toHaveBeenCalled();
  });
});
