import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { AdditionalSalaryRequestTestWrapper } from '../../AdditionalSalaryRequestTestWrapper';
import { defaultCompleteFormValues } from '../../Shared/CompleteForm.mock';
import { ContactInformation } from './ContactInformation';

interface TestWrapperProps {
  initialValues?: CompleteFormValues;
  pageType?: 'new' | 'edit' | 'view';
}

const TestWrapper: React.FC<TestWrapperProps> = ({
  initialValues = defaultCompleteFormValues,
  pageType = 'edit',
}) => (
  <AdditionalSalaryRequestTestWrapper
    initialValues={initialValues}
    pageType={pageType}
  >
    <ContactInformation />
  </AdditionalSalaryRequestTestWrapper>
);

describe('ContactInformation', () => {
  it('renders telephone number and email fields', () => {
    const { getByLabelText } = render(<TestWrapper />);

    expect(getByLabelText('Telephone Number')).toBeInTheDocument();
    expect(getByLabelText('Email Address')).toBeInTheDocument();
  });

  it('displays email address from initial values', async () => {
    const valuesWithEmail: CompleteFormValues = {
      ...defaultCompleteFormValues,
      emailAddress: 'test@example.com',
    };

    const { getByLabelText } = render(
      <TestWrapper initialValues={valuesWithEmail} />,
    );

    await waitFor(() => {
      expect(getByLabelText('Email Address')).toHaveValue('test@example.com');
    });
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

  it('displays email from initial values', async () => {
    const valuesWithEmail: CompleteFormValues = {
      ...defaultCompleteFormValues,
      emailAddress: 'test@example.com',
    };

    const { getByLabelText } = render(
      <TestWrapper initialValues={valuesWithEmail} />,
    );

    await waitFor(() => {
      expect(getByLabelText('Email')).toHaveValue('test@example.com');
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

  it('allows user to enter email address', async () => {
    const { getByLabelText } = render(<TestWrapper />);

    const emailInput = getByLabelText('Email');
    await waitFor(() => expect(emailInput).toBeEnabled());

    userEvent.type(emailInput, 'user@example.com');

    await waitFor(() => {
      expect(emailInput).toHaveValue('user@example.com');
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
