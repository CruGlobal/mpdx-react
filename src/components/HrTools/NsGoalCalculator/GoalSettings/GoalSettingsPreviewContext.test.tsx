import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { DeepPartial } from 'ts-essentials';
import {
  NsGoalCalculatorTestWrapper,
  defaultGoalCalculation,
} from '../NsGoalCalculatorTestWrapper';
import { GoalSettingsPreviewProvider } from './GoalSettingsPreviewContext';
import { PreviewNewStaffGoalCalculationMutation } from './NewStaffGoalCalculation.generated';
import { FinancialInformationSection } from './Sections/FinancialInformationSection';
import { NsoInformationSection } from './Sections/NsoInformationSection';
import { calculationToFormValues } from './goalSettingsApiMapping';
import { GoalSettingsSectionProps } from './goalSettingsSectionProps';

const accountListId = 'account-list-1';
const mutationSpy = jest.fn();

const savedCalculation = {
  ...defaultGoalCalculation,
  calculations: {
    ...defaultGoalCalculation.calculations,
    contributing403bAmount: 150,
    spouseContributing403bAmount: 200,
    specialNeedsLeft: 900,
  },
};

const sectionProps: GoalSettingsSectionProps = {
  hasSpouse: true,
  seniorStaff: false,
  calculations: {
    ...savedCalculation.calculations,
    contributing403bAmount: 1,
    spouseContributing403bAmount: 2,
    specialNeedsLeft: 3,
  },
  primaryName: 'John',
  spouseName: 'Jane',
  visibleHeaders: ['John (Joining)', 'Jane (Joining)'],
  sharedHeader: 'John (Joining) & Jane (Joining)',
  attendee: null,
};

const previewOf = (calculations: {
  contributing403bAmount?: number;
  spouseContributing403bAmount?: number;
  specialNeedsLeft?: number;
}): DeepPartial<PreviewNewStaffGoalCalculationMutation> => ({
  previewNewStaffGoalCalculation: {
    newStaffGoalCalculation: {
      id: savedCalculation.id,
      calculations,
    },
  },
});

const preview403b = previewOf({
  contributing403bAmount: 175,
  spouseContributing403bAmount: 210,
});

const TestComponent: React.FC<{
  previewMock?: DeepPartial<PreviewNewStaffGoalCalculationMutation>;
}> = ({ previewMock }) => (
  <NsGoalCalculatorTestWrapper previewMock={previewMock} onCall={mutationSpy}>
    <Formik
      initialValues={calculationToFormValues(savedCalculation)}
      onSubmit={jest.fn()}
    >
      <GoalSettingsPreviewProvider
        accountListId={accountListId}
        calculation={savedCalculation}
      >
        <FinancialInformationSection {...sectionProps} />
        <NsoInformationSection {...sectionProps} />
      </GoalSettingsPreviewProvider>
    </Formik>
  </NsGoalCalculatorTestWrapper>
);

describe('GoalSettingsPreviewContext', () => {
  it('shows the saved worksheet figures while the form is untouched', async () => {
    const { findByText, getByText } = render(<TestComponent />);

    const johnAmount = (await findByText('403(b) Amount — John')).parentElement;
    expect(johnAmount).toHaveTextContent('$150.00');
    expect(johnAmount).toHaveAttribute('aria-busy', 'false');
    expect(getByText('403(b) Amount — Jane').parentElement).toHaveTextContent(
      '$200.00',
    );
    expect(getByText('$900.00')).toBeInTheDocument();

    expect(mutationSpy).not.toHaveGraphqlOperation(
      'PreviewNewStaffGoalCalculation',
    );
  });

  it('substitutes the previewed 403(b) amounts after an unsaved edit', async () => {
    const { findByText, getByText, getByRole } = render(
      <TestComponent previewMock={preview403b} />,
    );

    const percentage = getByRole('spinbutton', {
      name: '403(b) Contribution — John',
    });
    userEvent.clear(percentage);
    userEvent.type(percentage, '10');
    expect(await findByText('$175.00')).toBeInTheDocument();
    expect(getByText('403(b) Amount — John').parentElement).toHaveTextContent(
      '$175.00',
    );
    expect(getByText('403(b) Amount — Jane').parentElement).toHaveTextContent(
      '$210.00',
    );
    expect(mutationSpy).toHaveGraphqlOperation(
      'PreviewNewStaffGoalCalculation',
      {
        input: {
          accountListId,
          id: savedCalculation.id,
          attributes: { contribution403bPercentage: 10 },
        },
      },
    );
  });

  it('substitutes the previewed special-needs remainder after an unsaved edit', async () => {
    const { findByText, getByRole } = render(
      <TestComponent previewMock={previewOf({ specialNeedsLeft: 450 })} />,
    );

    const supportRaised = getByRole('spinbutton', {
      name: 'Support Raised for NSO',
    });
    userEvent.clear(supportRaised);
    userEvent.type(supportRaised, '50');

    expect(await findByText('$450.00')).toBeInTheDocument();
    expect(mutationSpy).toHaveGraphqlOperation(
      'PreviewNewStaffGoalCalculation',
      {
        input: {
          accountListId,
          id: savedCalculation.id,
          attributes: { nsoSpecialNeedsSupportReceived: 50 },
        },
      },
    );
  });

  it('holds the previewed amount while a further edit is still in flight', async () => {
    const { findByText, getByText, queryByText, getByRole } = render(
      <TestComponent previewMock={preview403b} />,
    );

    const percentage = getByRole('spinbutton', {
      name: '403(b) Contribution — John',
    });
    userEvent.clear(percentage);
    userEvent.type(percentage, '10');
    expect(await findByText('$175.00')).toBeInTheDocument();

    userEvent.clear(percentage);
    userEvent.type(percentage, '12');

    const johnAmount = getByText('403(b) Amount — John').parentElement;
    expect(johnAmount).toHaveTextContent('$175.00');
    expect(johnAmount).toHaveAttribute('aria-busy', 'true');
    expect(queryByText('$150.00')).not.toBeInTheDocument();
  });
});
