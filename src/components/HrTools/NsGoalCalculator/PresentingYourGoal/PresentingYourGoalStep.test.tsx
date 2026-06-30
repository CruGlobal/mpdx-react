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

const TestComponent: React.FC = () => (
  <NsGoalCalculatorTestWrapper>
    <PresentingYourGoalStep goalCalculation={defaultGoalCalculation} />
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
      getByText('Adjust the Scale to fit on one page.'),
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
    const { getByText, findByText, findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Monthly Support Needs' }),
    ).toBeInTheDocument();
    expect(getByText('Salary (Combined)')).toBeInTheDocument();
    expect(getByText('$8,774')).toBeInTheDocument();
    expect(getByText('Ministry Expenses')).toBeInTheDocument();
    expect(getByText('$898')).toBeInTheDocument();
    expect(getByText('Benefits')).toBeInTheDocument();
    expect(getByText('$1,911')).toBeInTheDocument();
    expect(getByText('Social Security and Taxes')).toBeInTheDocument();
    expect(getByText('$1,492')).toBeInTheDocument();
    expect(getByText('Voluntary 403b Retirement Plan')).toBeInTheDocument();
    expect(getByText('$990')).toBeInTheDocument();
    expect(getByText('Administrative Charge')).toBeInTheDocument();
    expect(getByText('$1,795')).toBeInTheDocument();
    expect(getByText('Total Support Goal')).toBeInTheDocument();
    expect(getByText('$15,860')).toBeInTheDocument();
    expect(await findByText('Total Solid Support')).toBeInTheDocument();
    expect(await findByText('$1,200')).toBeInTheDocument();
  });

  it('hides the total solid support row until the support raised data loads', async () => {
    const { queryByText, findByText } = render(<TestComponent />);

    expect(queryByText('Total Solid Support')).not.toBeInTheDocument();
    expect(await findByText('Total Solid Support')).toBeInTheDocument();
  });

  it('renders the special needs section', async () => {
    const { findByRole, getByText } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Special Needs' }),
    ).toBeInTheDocument();
    expect(getByText('Total Special Needs Goal')).toBeInTheDocument();
    expect(getByText('$3,624')).toBeInTheDocument();
  });

  it('renders the monthly support needs chart and the special needs chart placeholder', async () => {
    const { findByRole, getByRole, getByTestId } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Monthly Support Needs Chart' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Special Needs Chart' }),
    ).toBeInTheDocument();
    expect(getByTestId('chart-placeholder')).toBeInTheDocument();
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
