import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import {
  NsGoalCalculatorTestWrapper,
  defaultGoalCalculation,
} from '../NsGoalCalculatorTestWrapper';
import { PresentingYourGoalStep } from './PresentingYourGoalStep';

interface TestComponentProps {
  supportRaised?: number | null;
}

const TestComponent: React.FC<TestComponentProps> = ({
  supportRaised = null,
}) => (
  <NsGoalCalculatorTestWrapper>
    <PresentingYourGoalStep
      goalCalculation={{
        ...defaultGoalCalculation,
        calculations: {
          ...defaultGoalCalculation.calculations,
          salary: 10000,
          seca: 1000,
          totalContributing403bAmount: 500,
          totalMinistryExpenses: 5000,
          medicalExpenses: 100,
          staffConferenceTransfer: 200,
          accountTransfers: 300,
          advocacyTransfers: 400,
          otherExpenses: 500,
          benefitsCharge: 600,
          adminCharge: 1200,
          attrition: 600,
          monthlyGoal: 20000,
          supportRaised,
          ibsNsoCost: 2000,
          faithAndFinanceCost: 500,
          refreshRetreatCost: 424,
          cruConferenceCost: 700,
          specialNeedsTotal: 3624,
        },
      }}
    />
  </NsGoalCalculatorTestWrapper>
);

describe('PresentingYourGoalStep', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterAll(() => {
    afterTestResizeObserver();
  });

  it('renders the step title, intro, and printing tips', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: 'Presenting Your Goal' }),
    ).toBeInTheDocument();
    expect(
      getByText(
        "Now that you've reviewed your goal, you can share your Support Needs Presentation by printing the presentation below.",
      ),
    ).toBeInTheDocument();
    expect(getByText('Some tips for printing:')).toBeInTheDocument();
    expect(
      getByText('Toggle off Headers and Footers in your print settings.'),
    ).toBeInTheDocument();
    expect(
      getByText(
        'From your Print settings, you may also save the page as a PDF to share digitally.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the personal information section', async () => {
    const { findByText, getByRole, getByText, getByTestId } = render(
      <TestComponent />,
    );

    expect(await findByText('John and Jane Doe')).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Personal Information' }),
    ).toBeInTheDocument();
    expect(getByText('Campus Crusade for Christ, Inc.')).toBeInTheDocument();
    expect(getByText('Lake Hart')).toBeInTheDocument();
    expect(getByTestId('cru-logo')).toBeInTheDocument();
  });

  it('renders the monthly support needs section', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('table', { name: 'Monthly Support Needs' }),
    ).toHaveTableStructure({
      rowHeaders: [
        expect.stringContaining('Salary (Combined)'),
        expect.stringContaining('Ministry Expenses'),
        expect.stringContaining('Benefits'),
        expect.stringContaining('Social Security and Taxes'),
        expect.stringContaining('Voluntary 403b Retirement Plan'),
        'Administrative Charge',
        'Total Support Goal',
      ],
      cells: [
        '$10,000',
        '$7,100',
        '$600',
        '$1,000',
        '$500',
        '$1,200',
        '$20,000',
      ],
    });
  });

  it('hides the total solid support for scenario goals', () => {
    const { queryByText } = render(<TestComponent supportRaised={null} />);

    expect(queryByText('Total Solid Support')).not.toBeInTheDocument();
  });

  it('renders the special needs section', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('table', { name: 'Special Needs' }),
    ).toHaveTableStructure({
      rowHeaders: [expect.stringContaining('Total Special Needs Goal')],
      cells: ['$3,624'],
    });
  });

  it('renders the monthly support needs chart and the special needs chart', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Monthly Support Needs Chart' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Special Needs Chart' }),
    ).toBeInTheDocument();
  });

  it('prints when the print button is clicked', () => {
    const printSpy = jest.spyOn(window, 'print').mockImplementation(() => {});
    const { getByRole } = render(<TestComponent />);

    userEvent.click(
      getByRole('button', { name: 'Print Support Needs Presentation' }),
    );

    expect(printSpy).toHaveBeenCalled();
  });

  it('renders the continue button', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });
});
