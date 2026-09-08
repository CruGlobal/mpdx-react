import React from 'react';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import {
  NsGoalCalculatorTestWrapper,
  defaultGoalCalculation,
} from '../../NsGoalCalculatorTestWrapper';
import {
  GoalSettingsAttendee,
  GoalSettingsSectionProps,
} from '../goalSettingsSectionProps';
import { NsoInformationSection } from './NsoInformationSection';

const defaultAttendee: GoalSettingsAttendee = {
  id: 'attendee-1',
  newStaffCohortId: 'cohort-1',
  cohortName: 'Fall NSO 2026',
  coordinators: ['Ada Lovelace'],
  ministry: { id: 'ministry-1', name: 'Campus' },
  coach: null,
};

const defaultProps: GoalSettingsSectionProps = {
  hasSpouse: true,
  seniorStaff: false,
  calculations: defaultGoalCalculation.calculations,
  primaryName: 'John',
  spouseName: 'Jane',
  visibleHeaders: ['John (Joining)', 'Jane (Senior)'],
  sharedHeader: 'John (Joining) & Jane (Senior)',
  attendee: null,
};

const TestComponent: React.FC<Partial<GoalSettingsSectionProps>> = (
  overrides,
) => (
  <NsGoalCalculatorTestWrapper>
    <Formik
      initialValues={{
        nsoHousing: '',
        nsoSessions: '',
        childcareChildrenCount: 0,
        nsoSpecialNeedsSupportReceived: 0,
      }}
      onSubmit={jest.fn()}
    >
      <NsoInformationSection {...defaultProps} {...overrides} />
    </Formik>
  </NsGoalCalculatorTestWrapper>
);

describe('NsoInformationSection', () => {
  it('renders the housing, trainings, childcare, and support fields', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('combobox', { name: 'Housing' })).toBeInTheDocument();
    expect(
      getByRole('combobox', { name: 'Trainings Attending' }),
    ).toBeInTheDocument();
    expect(
      getByRole('spinbutton', { name: 'Number Needing Childcare' }),
    ).toBeInTheDocument();
    expect(
      getByRole('spinbutton', { name: 'Support Raised for NSO' }),
    ).toBeInTheDocument();
  });

  it('renders the training row with the cohort name when an attendee is given', () => {
    const { getByRole } = render(<TestComponent attendee={defaultAttendee} />);

    expect(getByRole('textbox', { name: 'Training' })).toHaveValue(
      'Fall NSO 2026',
    );
  });

  it('hides the training row when there is no attendee', () => {
    const { queryByRole, queryByText } = render(
      <TestComponent attendee={null} />,
    );

    expect(
      queryByRole('textbox', { name: 'Training' }),
    ).not.toBeInTheDocument();
    // The row label lives outside the field, so it has to go with it.
    expect(queryByText('Training')).not.toBeInTheDocument();
  });

  it('renders the left-to-raise amount from the calculations prop', () => {
    const { getByText } = render(
      <TestComponent
        calculations={{
          ...defaultProps.calculations,
          specialNeedsLeft: 1234.5,
        }}
      />,
    );

    expect(getByText('$1,234.50')).toBeInTheDocument();
  });
});
