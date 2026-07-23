import React from 'react';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import {
  NsGoalCalculatorTestWrapper,
  defaultGoalCalculation,
} from '../../NsGoalCalculatorTestWrapper';
import { GoalSettingsSectionProps } from '../goalSettingsSectionProps';
import { NsoInformationSection } from './NsoInformationSection';

const defaultProps: GoalSettingsSectionProps = {
  hasSpouse: true,
  seniorStaff: false,
  calculations: defaultGoalCalculation.calculations,
  primaryName: 'John',
  spouseName: 'Jane',
  visibleHeaders: ['John (Joining)', 'Jane (Senior)'],
  sharedHeader: 'John (Joining) & Jane (Senior)',
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
