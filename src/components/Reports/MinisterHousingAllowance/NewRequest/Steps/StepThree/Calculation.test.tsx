import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { Calculation } from './Calculation';

const submit = jest.fn();
const handleBack = jest.fn();
const handleNext = jest.fn();
const boardApprovalDate = '2024-06-15';
const availableDate = '2024-07-01';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <TestRouter>
        <Formik
          initialValues={{ phone: '1234567890', email: 'john.doe@cru.org' }}
          onSubmit={submit}
        >
          <Calculation
            boardApprovalDate={boardApprovalDate}
            availableDate={availableDate}
            handleBack={handleBack}
            handleNext={handleNext}
          />
        </Formik>
      </TestRouter>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('Calculation', () => {
  it('renders the component', () => {
    const { getByText, getByRole } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: 'Calculate Your MHA Request' }),
    ).toBeInTheDocument();
    expect(
      getByText(/please enter dollar amounts for each category below/i),
    ).toBeInTheDocument();

    expect(
      getByRole('checkbox', { name: /i understand that my approved/i }),
    ).toBeInTheDocument();

    expect(getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /back/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should show validation error when inputs are invalid', async () => {
    const { findByText, getByRole, findByRole, getByText } = render(
      <TestComponent />,
    );

    const row = getByRole('row', {
      name: /average monthly amount for unexpected/i,
    });
    const input = within(row).getByPlaceholderText(/enter amount/i);

    await userEvent.type(input, '100');
    expect(input).toHaveValue('100');
    await userEvent.clear(input);
    expect(input).toHaveValue('');

    input.focus();
    await userEvent.tab();

    expect(await findByText('Required field.')).toBeInTheDocument();

    const submitButton = getByRole('button', { name: /submit/i });

    await userEvent.click(submitButton);

    expect(await findByRole('alert')).toBeInTheDocument();
    expect(
      getByText('Please enter a value for all required fields.'),
    ).toBeInTheDocument();
  });

  it('should show validation error when checkbox is not checked', async () => {
    const { findByText, getByRole, getByText, findByRole } = render(
      <TestComponent />,
    );

    const submitButton = getByRole('button', { name: /submit/i });

    await userEvent.click(submitButton);

    expect(
      await findByText('This box must be checked to continue.'),
    ).toBeInTheDocument();

    expect(await findByRole('alert')).toBeInTheDocument();
    expect(
      getByText(
        'Please check the box above if you understand how this was calculated.',
      ),
    ).toBeInTheDocument();
  });

  it('shows validation errors when inputs are invalid', async () => {
    const { getByRole, findByText } = render(<TestComponent />);

    const phone = getByRole('textbox', { name: 'Telephone Number' });
    const email = getByRole('textbox', { name: 'Email' });

    expect(phone).toHaveValue('1234567890');
    expect(email).toHaveValue('john.doe@cru.org');

    await userEvent.clear(phone);
    await userEvent.tab();
    expect(await findByText('Phone Number is required.')).toBeInTheDocument();

    await userEvent.clear(email);
    await userEvent.tab();
    expect(await findByText('Email is required.')).toBeInTheDocument();

    await userEvent.type(phone, 'abc');
    await userEvent.tab();
    expect(await findByText('Invalid phone number.')).toBeInTheDocument();

    await userEvent.type(email, 'invalid-email');
    await userEvent.tab();
    expect(await findByText('Invalid email address.')).toBeInTheDocument();
  });

  it('shows confirmation modal when submit is clicked', async () => {
    const { getByRole, getByText, findByRole } = render(<TestComponent />);

    const row1 = getByRole('row', {
      name: /monthly rent/i,
    });
    const input1 = within(row1).getByPlaceholderText(/enter amount/i);

    const row2 = getByRole('row', { name: /monthly value for furniture/i });
    const input2 = within(row2).getByPlaceholderText(/enter amount/i);

    const row3 = getByRole('row', {
      name: /estimated monthly cost of repairs/i,
    });
    const input3 = within(row3).getByPlaceholderText(/enter amount/i);

    const row4 = getByRole('row', {
      name: /average monthly utility costs/i,
    });
    const input4 = within(row4).getByPlaceholderText(/enter amount/i);

    const row5 = getByRole('row', {
      name: /average monthly amount for unexpected/i,
    });
    const input5 = within(row5).getByPlaceholderText(/enter amount/i);

    await userEvent.type(input1, '1000');
    await userEvent.type(input2, '200');
    await userEvent.type(input3, '300');
    await userEvent.type(input4, '400');
    await userEvent.type(input5, '500');

    const checkbox = getByRole('checkbox', {
      name: /i understand that my approved/i,
    });
    await userEvent.click(checkbox);

    const submitButton = getByRole('button', { name: /submit/i });

    await userEvent.click(submitButton);

    expect(await findByRole('dialog')).toBeInTheDocument();

    expect(
      getByRole('heading', {
        name: 'Are you ready to submit your MHA request?',
      }),
    ).toBeInTheDocument();
    expect(
      getByText(/you are submitting your mha request for board approval/i),
    ).toBeInTheDocument();

    expect(getByRole('button', { name: /go back/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /yes, continue/i })).toBeInTheDocument();
  });
});
