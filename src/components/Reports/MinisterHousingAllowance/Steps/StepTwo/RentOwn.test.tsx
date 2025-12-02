import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import theme from 'src/theme';
import { MinisterHousingAllowanceProvider } from '../../Shared/Context/MinisterHousingAllowanceContext';
import { RentOwn } from './RentOwn';

const submit = jest.fn();

interface TestComponentProps {
  pageType?: PageEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({ pageType }) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider>
        <Formik initialValues={{}} onSubmit={submit}>
          <MinisterHousingAllowanceProvider type={pageType}>
            <RentOwn />
          </MinisterHousingAllowanceProvider>
        </Formik>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('RentOwn', () => {
  it('renders form and options for new page', async () => {
    const { getByRole, getByText } = render(
      <TestComponent pageType={PageEnum.New} />,
    );

    expect(getByRole('heading', { name: 'Rent or Own?' })).toBeInTheDocument();

    expect(getByText('Rent')).toBeInTheDocument();
    expect(getByText('Own')).toBeInTheDocument();

    await userEvent.click(getByText('Rent'));
    expect(getByRole('radio', { name: 'Rent' })).toBeChecked();
  });

  it('renders form and options for edit page', async () => {
    const { getByRole, getByText } = render(
      <TestComponent pageType={PageEnum.Edit} />,
    );

    expect(getByRole('heading', { name: 'Rent or Own?' })).toBeInTheDocument();
    expect(
      getByText(/if this has changed from your previous submission/i),
    ).toBeInTheDocument();

    expect(getByRole('radio', { name: 'Rent' })).not.toBeChecked();
    expect(getByRole('radio', { name: 'Own' })).not.toBeChecked();
  });
});
