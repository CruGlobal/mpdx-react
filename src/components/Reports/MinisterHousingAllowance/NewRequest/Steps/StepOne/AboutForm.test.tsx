import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import {
  MinisterHousingAllowanceProvider,
  useMinisterHousingAllowance,
} from '../../../Shared/MinisterHousingAllowanceContext';
import { AboutForm } from './AboutForm';

const submit = jest.fn();
const boardApprovalDate = '2024-09-15';
const availabilityDate = '2024-10-01';
const handleRightPanelOpen = jest.fn();

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <Formik initialValues={{}} onSubmit={submit}>
        <MinisterHousingAllowanceProvider>
          <AboutForm
            boardApprovalDate={boardApprovalDate}
            availableDate={availabilityDate}
          />
        </MinisterHousingAllowanceProvider>
      </Formik>
    </TestRouter>
  </ThemeProvider>
);

jest.mock('../../../Shared/MinisterHousingAllowanceContext', () => ({
  ...jest.requireActual('../../../Shared/MinisterHousingAllowanceContext'),
  useMinisterHousingAllowance: jest.fn(),
}));

(useMinisterHousingAllowance as jest.Mock).mockReturnValue({
  handleRightPanelOpen,
});

describe('AboutForm', () => {
  it('renders form and formatted dates', () => {
    const { getByText, getByRole } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: 'About this Form' }),
    ).toBeInTheDocument();
    expect(
      getByText(
        /a minister's housing allowance request is a form ministers complete/i,
      ),
    ).toBeInTheDocument();
    expect(getByText(/9\/15\/2024/)).toBeInTheDocument();
    expect(getByText(/10\/1\/2024/)).toBeInTheDocument();
  });

  it('renders Cancel and Continue buttons', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('button', { name: 'CANCEL' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'CONTINUE' })).toBeInTheDocument();
  });

  it('opens panel when link is clicked', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(
      getByRole('button', { name: /what expenses can i claim on my mha/i }),
    );

    expect(handleRightPanelOpen).toHaveBeenCalled();
  });
});
