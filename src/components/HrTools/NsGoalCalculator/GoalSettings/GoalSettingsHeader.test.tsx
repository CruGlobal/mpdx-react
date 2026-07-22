import React from 'react';
import { ThemeProvider } from '@mui/material';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, Formik } from 'formik';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { GoalSettingsHeader } from './GoalSettingsHeader';
import { GoalSettingsPerson } from './goalSettingsFormValues';

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

interface TestComponentProps {
  spouse?: GoalSettingsPerson | null;
  mpdGoal?: number;
  joinedStaffYear?: number | null;
  isScenario?: boolean;
  isComplete?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  spouse = spousePerson,
  mpdGoal = 50000,
  joinedStaffYear = 2018,
  isScenario,
  isComplete,
}) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <GqlMockedProvider>
        <Formik
          initialValues={{ calculationsYear: '2020' }}
          onSubmit={jest.fn()}
        >
          <Form>
            <GoalSettingsHeader
              primaryPerson={primaryPerson}
              spousePerson={spouse}
              mpdGoal={mpdGoal}
              joinedStaffYear={joinedStaffYear}
              isScenario={isScenario}
              isComplete={isComplete}
            />
          </Form>
        </Formik>
      </GqlMockedProvider>
    </SnackbarProvider>
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

  it('marks the calculation as incomplete when required fields are unfilled', () => {
    const { getByText, queryByText } = render(<TestComponent />);

    expect(getByText('Incomplete')).toBeInTheDocument();
    expect(queryByText('Complete')).not.toBeInTheDocument();
  });

  it('marks the calculation as complete when required fields are filled', () => {
    const { getByText, queryByText } = render(<TestComponent isComplete />);

    expect(getByText('Complete')).toBeInTheDocument();
    expect(queryByText('Incomplete')).not.toBeInTheDocument();
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
    expect(getByRole('combobox')).toHaveTextContent('2020');
  });

  it('exposes an accessible label on the calculation-year help button', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('button', { name: 'About the calculation year' }),
    ).toBeInTheDocument();
  });

  it('spans calculation years from joinedStaffYear to the current year, newest first', () => {
    const { getByRole } = render(<TestComponent joinedStaffYear={2018} />);

    userEvent.click(getByRole('combobox'));
    const options = within(getByRole('listbox')).getAllByRole('option');

    expect(options.map((option) => option.textContent)).toEqual([
      '2020',
      '2019',
      '2018',
    ]);
  });

  it('offers only the current year when joinedStaffYear is missing', () => {
    const { getByRole } = render(<TestComponent joinedStaffYear={null} />);

    userEvent.click(getByRole('combobox'));
    const options = within(getByRole('listbox')).getAllByRole('option');

    expect(options.map((option) => option.textContent)).toEqual(['2020']);
  });

  it('offers only the current year when joinedStaffYear is in the future', () => {
    const { getByRole } = render(<TestComponent joinedStaffYear={2030} />);

    userEvent.click(getByRole('combobox'));
    const options = within(getByRole('listbox')).getAllByRole('option');

    expect(options.map((option) => option.textContent)).toEqual(['2020']);
  });

  describe('scenario mode', () => {
    it('shows the Scenario Only chip and hides the person, coach, and coordinator cards', () => {
      const { getByText, queryByText, queryByRole } = render(
        <TestComponent isScenario />,
      );

      expect(getByText('Scenario Only')).toBeInTheDocument();
      expect(queryByText('Incomplete')).not.toBeInTheDocument();
      // Person cards render the "Person Number:" line; it must be absent.
      expect(queryByText(/Person Number:/)).not.toBeInTheDocument();
      expect(queryByRole('textbox', { name: 'Coach' })).not.toBeInTheDocument();
      expect(
        queryByRole('textbox', { name: 'Coordinator' }),
      ).not.toBeInTheDocument();
    });

    it('shows the person, coach, and coordinator cards and no Scenario Only chip by default', () => {
      const { getAllByText, getByRole, queryByText } = render(
        <TestComponent />,
      );

      expect(queryByText('Scenario Only')).not.toBeInTheDocument();
      expect(getAllByText(/Person Number:/).length).toBeGreaterThan(0);
      expect(getByRole('textbox', { name: 'Coach' })).toBeInTheDocument();
      expect(getByRole('textbox', { name: 'Coordinator' })).toBeInTheDocument();
    });
  });
});
