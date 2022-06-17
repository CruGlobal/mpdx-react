import { ThemeProvider } from '@material-ui/core';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import theme from '../../../theme';
import { FixEmailAddressPerson } from './FixEmailAddressPerson';

const testData = {
  name: 'Test Contact',
  id: 'testid',
  emails: [
    {
      source: 'DonorHub',
      updatedAt: '06/21/2021',
      email: 'test1@test1.com',
      primary: true,
    },
    {
      source: 'MPDX',
      updatedAt: '06/22/2021',
      email: 'test2@test1.com',
      primary: false,
    },
  ],
};

describe('FixEmailAddresses-Contact', () => {
  it('default', () => {
    const handleChangeMock = jest.fn();
    const handleDeleteModalOpenMock = jest.fn();
    const handleAddMock = jest.fn();
    const handleChangePrimaryMock = jest.fn();

    const { getByText, getByTestId, getByDisplayValue } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <FixEmailAddressPerson
            toDelete={[]}
            name={testData.name}
            key={testData.name}
            personId={testData.id}
            emails={testData.emails}
            handleChange={handleChangeMock}
            handleDelete={handleDeleteModalOpenMock}
            handleAdd={handleAddMock}
            handleChangePrimary={handleChangePrimaryMock}
          />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(getByText(testData.name)).toBeInTheDocument();
    expect(getByText('DonorHub (06/21/2021)')).toBeInTheDocument();
    expect(getByTestId('textfield-testid-0')).toBeInTheDocument();
    expect(getByDisplayValue('test1@test1.com')).toBeInTheDocument();
    expect(getByText('MPDX (06/22/2021)')).toBeInTheDocument();
    expect(getByTestId('textfield-testid-1')).toBeInTheDocument();
    expect(getByDisplayValue('test2@test1.com')).toBeInTheDocument();
  });

  it('input reset after adding an email address', () => {
    const handleChangeMock = jest.fn();
    const handleDeleteModalOpenMock = jest.fn();
    const handleAddMock = jest.fn();
    const handleChangePrimaryMock = jest.fn();

    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <FixEmailAddressPerson
            toDelete={[]}
            name={testData.name}
            key={testData.name}
            personId={testData.id}
            emails={testData.emails}
            handleChange={handleChangeMock}
            handleDelete={handleDeleteModalOpenMock}
            handleAdd={handleAddMock}
            handleChangePrimary={handleChangePrimaryMock}
          />
        </TestWrapper>
      </ThemeProvider>,
    );

    const addInput = getByTestId('addNewEmailInput-testid') as HTMLInputElement;
    const addButton = getByTestId('addButton-testid');

    userEvent.type(addInput, 'new@new.com');
    expect(addInput.value).toBe('new@new.com');
    userEvent.click(addButton);
    expect(addInput.value).toBe('');
  });
});
