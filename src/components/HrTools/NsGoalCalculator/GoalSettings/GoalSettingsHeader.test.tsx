import React from 'react';
import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import { Form, Formik } from 'formik';
import theme from 'src/theme';
import { GoalSettingsHeader } from './GoalSettingsHeader';
import { GoalSettingsPerson } from './goalSettingsFormValues';
import { GoalSettingsOptions } from './useGoalSettingsOptions';

const primaryPerson: GoalSettingsPerson = {
  firstName: 'John',
  lastName: 'Doe',
  personNumber: '123',
  emailAddress: 'john@cru.org',
  phoneNumber: '555-0001',
  address: '1 Lake Hart',
};

const spousePerson: GoalSettingsPerson = {
  firstName: 'Jane',
  lastName: 'Doe',
  personNumber: '456',
  emailAddress: 'jane@cru.org',
  phoneNumber: '555-0002',
  address: '1 Lake Hart',
};

// Header only consumes `options.calculationsYear`; the rest are required by the
// type but unused here, so they stay empty.
const options: GoalSettingsOptions = {
  age: [],
  spouseJoining: [],
  allowSalaryOverCap: [],
  maritalStatus: [],
  role: [],
  benefitsPlan: [],
  geographicLocation: [],
  nsoHousing: [],
  nsoSessions: [],
  calculationsYear: [
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
  ],
};

interface TestComponentProps {
  spouse?: GoalSettingsPerson | null;
  mpdGoal?: number;
}

const TestComponent: React.FC<TestComponentProps> = ({
  spouse = spousePerson,
  mpdGoal = 50000,
}) => (
  <ThemeProvider theme={theme}>
    <Formik initialValues={{ calculationsYear: '2026' }} onSubmit={jest.fn()}>
      <Form>
        <GoalSettingsHeader
          primaryPerson={primaryPerson}
          spousePerson={spouse}
          mpdGoal={mpdGoal}
          options={options}
        />
      </Form>
    </Formik>
  </ThemeProvider>
);

describe('GoalSettingsHeader', () => {
  it('shows a combined household title for a couple', () => {
    const { getByRole } = render(<TestComponent />);

    // Level 5 = the household title (h5); the person cards are subtitle h6.
    expect(
      getByRole('heading', { level: 5, name: 'John & Jane Doe' }),
    ).toBeInTheDocument();
  });

  it('shows only the primary person in the title when single', () => {
    const { getByRole } = render(<TestComponent spouse={null} />);

    expect(
      getByRole('heading', { level: 5, name: 'John Doe' }),
    ).toBeInTheDocument();
  });

  it('marks the calculation as incomplete', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('Incomplete')).toBeInTheDocument();
  });

  it('formats the MPD goal as currency', () => {
    const { getByText } = render(<TestComponent mpdGoal={50000} />);

    expect(getByText('MPD Goal: $50,000.00')).toBeInTheDocument();
  });

  it('formats a zero MPD goal rather than rendering blank', () => {
    const { getByText } = render(<TestComponent mpdGoal={0} />);

    expect(getByText('MPD Goal: $0.00')).toBeInTheDocument();
  });

  it('renders the primary person contact details', () => {
    // Single, so the shared address isn't duplicated across two cards.
    const { getByText } = render(<TestComponent spouse={null} />);

    expect(getByText('Person Number: 123')).toBeInTheDocument();
    expect(getByText('john@cru.org')).toBeInTheDocument();
    expect(getByText('555-0001')).toBeInTheDocument();
    expect(getByText('1 Lake Hart')).toBeInTheDocument();
  });

  it('renders a spouse contact card for a couple', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('Person Number: 456')).toBeInTheDocument();
    expect(getByText('jane@cru.org')).toBeInTheDocument();
  });

  it('omits the spouse contact card when single', () => {
    const { queryByText } = render(<TestComponent spouse={null} />);

    expect(queryByText('Person Number: 456')).not.toBeInTheDocument();
    expect(queryByText('jane@cru.org')).not.toBeInTheDocument();
  });

  it('shows the calculation-year selector with the selected year', () => {
    const { getByText, getByRole } = render(<TestComponent />);

    expect(getByText('Calculate using:')).toBeInTheDocument();
    // The select's only combobox displays the chosen year.
    expect(getByRole('combobox')).toHaveTextContent('2026');
  });

  it('exposes an accessible label on the calculation-year help button', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('button', { name: 'About the calculation year' }),
    ).toBeInTheDocument();
  });
});
