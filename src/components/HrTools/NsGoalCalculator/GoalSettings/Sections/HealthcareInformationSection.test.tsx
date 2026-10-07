import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import {
  MpdGoalBenefitsConstantPlanEnum,
  MpdGoalBenefitsConstantSizeEnum,
} from 'src/graphql/types.generated';
import {
  NsGoalCalculatorTestWrapper,
  defaultGoalCalculation,
} from '../../NsGoalCalculatorTestWrapper';
import { GoalSettingsSectionProps } from '../goalSettingsSectionProps';
import { HealthcareInformationSection } from './HealthcareInformationSection';

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

// The API's display names differ from the app's labels, so the test can tell
// which one the dropdown shows
const benefitsConstant = (
  size: MpdGoalBenefitsConstantSizeEnum,
  plan: MpdGoalBenefitsConstantPlanEnum,
) => ({ size, plan, planDisplayName: `API ${plan}` });

const TestComponent: React.FC = () => (
  <NsGoalCalculatorTestWrapper
    constantsMock={{
      mpdGoalBenefitsConstants: [
        benefitsConstant(
          MpdGoalBenefitsConstantSizeEnum.Single,
          MpdGoalBenefitsConstantPlanEnum.Minimum,
        ),
        benefitsConstant(
          MpdGoalBenefitsConstantSizeEnum.Single,
          MpdGoalBenefitsConstantPlanEnum.Select,
        ),
        benefitsConstant(
          MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren,
          MpdGoalBenefitsConstantPlanEnum.Minimum,
        ),
        benefitsConstant(
          MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren,
          MpdGoalBenefitsConstantPlanEnum.Exempt,
        ),
      ],
    }}
  >
    <Formik
      initialValues={{
        calculationsYear: '',
        benefitsPlan: '',
        healthcareDependentsCount: 0,
      }}
      onSubmit={jest.fn()}
    >
      <HealthcareInformationSection {...defaultProps} />
    </Formik>
  </NsGoalCalculatorTestWrapper>
);

describe('HealthcareInformationSection', () => {
  it('lists each benefits plan from the constants once, in the order the API returns them, with localized labels', async () => {
    const { getByRole, findByRole, getAllByRole } = render(<TestComponent />);

    userEvent.click(getByRole('combobox', { name: 'Benefits Selection' }));

    expect(await findByRole('option', { name: 'Exempt' })).toBeInTheDocument();
    expect(getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Minimum',
      'Select',
      'Exempt',
    ]);
  });
});
