import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import TestWrapper from '__tests__/util/TestWrapper';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import theme from '../../../theme';
import {
  FixEmailAddressPerson,
  FixEmailAddressPersonProps,
} from './FixEmailAddressPerson';
import { EmailAddressData } from './FixEmailAddresses';

const testData = {
  name: 'Test Contact',
  personId: 'testid',
  contactId: 'contactTestId',
  emailAddresses: [
    {
      source: 'DonorHub',
      updatedAt: DateTime.fromISO('2021-06-21').toString(),
      email: 'test1@test1.com',
      primary: true,
      isValid: false,
      personId: 'testid',
      isPrimary: true,
    } as EmailAddressData,
    {
      source: 'MPDX',
      updatedAt: DateTime.fromISO('2021-06-22').toString(),
      email: 'test2@test1.com',
      primary: false,
      isValid: false,
      personId: 'testid',
      isPrimary: false,
    } as EmailAddressData,
  ],
} as FixEmailAddressPersonProps;

const setContactFocus = jest.fn();

const TestComponent: React.FC = () => {
  const handleChangeMock = jest.fn();
  const handleDeleteModalOpenMock = jest.fn();
  const handleAddMock = jest.fn();
  const handleChangePrimaryMock = jest.fn();
  return (
    <ThemeProvider theme={theme}>
      <TestWrapper>
        <FixEmailAddressPerson
          toDelete={[]}
          name={testData.name}
          key={testData.name}
          personId={testData.personId}
          contactId={testData.contactId}
          emailAddresses={testData.emailAddresses}
          handleChange={handleChangeMock}
          handleDelete={handleDeleteModalOpenMock}
          handleAdd={handleAddMock}
          handleChangePrimary={handleChangePrimaryMock}
          setContactFocus={setContactFocus}
        />
      </TestWrapper>
    </ThemeProvider>
  );
};

describe('FixEmailAddresses-Contact', () => {
  it('default', () => {
    const { getByText, getByTestId, getByDisplayValue } = render(
      <TestComponent />,
    );

    expect(getByText(testData.name)).toBeInTheDocument();
    expect(getByText('DonorHub (6/21/2021)')).toBeInTheDocument();
    expect(getByTestId('textfield-testid-0')).toBeInTheDocument();
    expect(getByDisplayValue('test1@test1.com')).toBeInTheDocument();
    expect(getByText('MPDX (6/22/2021)')).toBeInTheDocument();
    expect(getByTestId('textfield-testid-1')).toBeInTheDocument();
    expect(getByDisplayValue('test2@test1.com')).toBeInTheDocument();
  });

  it('input reset after adding an email address', async () => {
    const { getByTestId, getByLabelText } = render(<TestComponent />);

    const addInput = getByLabelText('New Email Address');
    const addButton = getByTestId('addButton-testid');

    userEvent.type(addInput, 'new@new.com');
    await waitFor(() => {
      expect(addInput).toHaveValue('new@new.com');
    });
    userEvent.click(addButton);
    await waitFor(() => {
      expect(addInput).toHaveValue('');
    });
  });

  describe('validation', () => {
    it('should show an error message if there is no email', async () => {
      const { getByLabelText, getByTestId, getByText } = render(
        <TestComponent />,
      );

      const addInput = getByLabelText('New Email Address');
      userEvent.click(addInput);
      userEvent.tab();

      const addButton = getByTestId('addButton-testid');
      await waitFor(() => {
        expect(addButton).toBeDisabled();
        expect(getByText('Please enter a valid email address')).toBeVisible();
      });
    });

    it('should show an error message if there is an invalid email', async () => {
      const { getByLabelText, getByTestId, getByText } = render(
        <TestComponent />,
      );

      const addInput = getByLabelText('New Email Address');
      userEvent.type(addInput, 'ab');
      userEvent.tab();

      const addButton = getByTestId('addButton-testid');
      await waitFor(() => {
        expect(addButton).toBeDisabled();
        expect(getByText('Invalid Email Address Format')).toBeVisible();
      });
    });

    it('should not disable the add button', async () => {
      const { getByLabelText, getByTestId } = render(<TestComponent />);

      const addInput = getByLabelText('New Email Address');
      userEvent.type(addInput, 'new@new.com');
      userEvent.tab();

      const addButton = getByTestId('addButton-testid');
      await waitFor(() => {
        expect(addButton).not.toBeDisabled();
      });
    });
  });
});
