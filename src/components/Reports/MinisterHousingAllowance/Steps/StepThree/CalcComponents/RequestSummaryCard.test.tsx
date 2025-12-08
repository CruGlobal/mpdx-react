import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MhaRentOrOwnEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { MinisterHousingAllowanceProvider } from '../../../Shared/Context/MinisterHousingAllowanceContext';
import { RequestSummaryCard } from './RequestSummaryCard';

const submit = jest.fn();
interface TestComponentProps {
  rentOrOwn?: MhaRentOrOwnEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({ rentOrOwn }) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider>
        <MinisterHousingAllowanceProvider>
          <Formik initialValues={{}} onSubmit={submit}>
            <RequestSummaryCard rentOrOwn={rentOrOwn} />
          </Formik>
        </MinisterHousingAllowanceProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('RequestSummaryCard', () => {
  it('renders the card for own', () => {
    const { getByText } = render(
      <TestComponent rentOrOwn={MhaRentOrOwnEnum.Own} />,
    );

    expect(getByText('Your MHA Request Summary')).toBeInTheDocument();
    expect(getByText('Own')).toBeInTheDocument();
    expect(getByText('Your Annual MHA Total')).toBeInTheDocument();
    expect(
      getByText(/This is calculated from your above responses/),
    ).toBeInTheDocument();
  });

  it('renders the card for rent', () => {
    const { getByText } = render(
      <TestComponent rentOrOwn={MhaRentOrOwnEnum.Rent} />,
    );

    expect(getByText('Your MHA Request Summary')).toBeInTheDocument();
    expect(getByText('Rent')).toBeInTheDocument();
  });
});
