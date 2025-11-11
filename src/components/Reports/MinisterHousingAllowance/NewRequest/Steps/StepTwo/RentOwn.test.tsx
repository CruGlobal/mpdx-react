import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { MinisterHousingAllowanceProvider } from '../../../Shared/MinisterHousingAllowanceContext';
import { PageEnum } from '../../../Shared/sharedTypes';
import { RentOwn } from './RentOwn';

const submit = jest.fn();

interface TestComponentProps {
  pageType?: PageEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({ pageType }) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <Formik initialValues={{}} onSubmit={submit}>
        <MinisterHousingAllowanceProvider type={pageType}>
          <RentOwn />
        </MinisterHousingAllowanceProvider>
      </Formik>
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

  it('opens confirmation modal when changing selection', async () => {
    const { getByRole, getByText } = render(
      <TestComponent pageType={PageEnum.New} />,
    );

    await userEvent.click(getByText('Rent'));
    expect(getByRole('radio', { name: 'Rent' })).toBeChecked();

    await userEvent.click(getByText('Own'));

    expect(
      getByText('Are you sure you want to change selection?'),
    ).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: /continue/i }));

    expect(getByRole('radio', { name: 'Own' })).toBeChecked();

    await userEvent.click(getByText('Rent'));
    await userEvent.click(getByRole('button', { name: /no/i }));

    expect(getByRole('radio', { name: 'Own' })).toBeChecked();
  });
});
