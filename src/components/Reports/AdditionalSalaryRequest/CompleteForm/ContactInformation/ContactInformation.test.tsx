import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { AdditionalSalaryRequestTestWrapper } from '../../AdditionalSalaryRequestTestWrapper';
import { defaultCompleteFormValues } from '../../Shared/CompleteForm.mock';
import { ContactInformation } from './ContactInformation';

interface TestWrapperProps {
  initialValues?: CompleteFormValues;
  email?: string;
  pageType?: 'new' | 'edit' | 'view';
}

const TestWrapper: React.FC<TestWrapperProps> = ({
  initialValues = defaultCompleteFormValues,
  email = '',
  pageType = 'edit',
}) => (
  <AdditionalSalaryRequestTestWrapper
    initialValues={initialValues}
    pageType={pageType}
  >
    <ContactInformation email={email} />
  </AdditionalSalaryRequestTestWrapper>
);

describe('ContactInformation', () => {
  it('renders telephone number field', () => {
    const { getByLabelText, getByDisplayValue } = render(
      <TestWrapper email="test@example.com" />,
    );

    expect(getByLabelText('Telephone Number')).toBeInTheDocument();
    expect(getByLabelText('Email')).toBeInTheDocument();
    expect(getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('displays telephone number from initial values', async () => {
    const valuesWithPhone: CompleteFormValues = {
      ...defaultCompleteFormValues,
      phoneNumber: '555-1234',
    };

    const { getByLabelText } = render(
      <TestWrapper initialValues={valuesWithPhone} />,
    );

    await waitFor(() => {
      expect(getByLabelText('Telephone Number')).toHaveValue('555-1234');
    });
  });

  it('allows user to enter telephone number', async () => {
    const { getByLabelText } = render(<TestWrapper />);

    const phoneInput = getByLabelText('Telephone Number');
    await waitFor(() => expect(phoneInput).toBeEnabled());

    userEvent.type(phoneInput, '555-5678');

    await waitFor(() => {
      expect(phoneInput).toHaveValue('555-5678');
    });
  });

  it('shows validation error when telephone number is empty and touched', async () => {
    const { getByLabelText, findByText } = render(<TestWrapper />);
    const phoneInput = getByLabelText('Telephone Number');
    await waitFor(() => expect(phoneInput).toBeEnabled());

    userEvent.click(phoneInput);
    userEvent.tab();

    expect(
      await findByText('Telephone number is required'),
    ).toBeInTheDocument();
  });

  it('clears validation error when telephone number is entered', async () => {
    const { getByLabelText, queryByText, findByText } = render(<TestWrapper />);
    const phoneInput = getByLabelText('Telephone Number');
    await waitFor(() => expect(phoneInput).toBeEnabled());

    userEvent.click(phoneInput);
    userEvent.tab();

    expect(
      await findByText('Telephone number is required'),
    ).toBeInTheDocument();

    userEvent.type(phoneInput, '555-9999');

    await waitFor(() => {
      expect(
        queryByText('Telephone number is required'),
      ).not.toBeInTheDocument();
    });
  });
});
