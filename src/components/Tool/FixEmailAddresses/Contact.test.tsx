import { ThemeProvider } from '@material-ui/core';
import React from 'react';
import { render } from '../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import theme from '../../../theme';
import Contact from './Contact';

const testData = {
  name: 'Test Contact',
  id: 'testid',
  emails: [
    {
      source: 'DonorHub',
      date: '06/21/2021',
      address: 'test1@test1.com',
      primary: true,
    },
    {
      source: 'MPDX',
      date: '06/22/2021',
      address: 'test2@test1.com',
      primary: false,
    },
  ],
};

describe('FixEmailAddresses', () => {
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
    expect(getByTestId('textfield-0')).toBeInTheDocument();
    expect(getByDisplayValue('test1@test1.com')).toBeInTheDocument();
    expect(getByText('MPDX (06/22/2021)')).toBeInTheDocument();
    expect(getByTestId('textfield-1')).toBeInTheDocument();
    expect(getByDisplayValue('test2@test1.com')).toBeInTheDocument();
  });
});
