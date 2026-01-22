import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import theme from 'src/theme';
import { MinisterHousingAllowanceProvider } from '../../Shared/Context/MinisterHousingAllowanceContext';
import { AboutForm } from './AboutForm';

const submit = jest.fn();
const boardApprovedAt = '2024-09-15';
const availabilityDate = '2024-10-01';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider>
        <MinisterHousingAllowanceProvider type={PageEnum.New}>
          <Formik initialValues={{}} onSubmit={submit}>
            <AboutForm
              boardApprovedAt={boardApprovedAt}
              availableDate={availabilityDate}
            />
          </Formik>
        </MinisterHousingAllowanceProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('AboutForm', () => {
  it('renders form and formatted dates', async () => {
    const { getByText, getByRole, findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'About this Form' }),
    ).toBeInTheDocument();
    expect(
      getByText(
        /a minister's housing allowance request is a form ministers complete/i,
      ),
    ).toBeInTheDocument();
    expect(getByText(/9\/15\/2024/)).toBeInTheDocument();
    expect(getByText(/10\/1\/2024/)).toBeInTheDocument();

    expect(getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });
});
