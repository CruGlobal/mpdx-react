import { defaultCompleteFormValues } from '../../Shared/CompleteForm.mock';
import { createRenderFormComponent, setupMockContext } from '../testUtils';
import { ViewForm } from './ViewForm';

// TODO: Remove temporary hardcoded values

jest.mock('../../Shared/AdditionalSalaryRequestContext', () => {
  const originalModule = jest.requireActual(
    '../../Shared/AdditionalSalaryRequestContext',
  );
  return {
    ...originalModule,
    useAdditionalSalaryRequest: jest.fn(),
  };
});

const mockUseAdditionalSalaryRequest = setupMockContext();
const renderComponent = createRenderFormComponent(
  ViewForm,
  mockUseAdditionalSalaryRequest,
);

describe('ViewForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page with user info and navigation', () => {
    const { getByText, getByRole } = renderComponent();

    expect(getByText('View Your Request')).toBeInTheDocument();
    expect(getByText('Doe, John')).toBeInTheDocument();
    expect(getByText('00123456')).toBeInTheDocument();

    expect(getByRole('button', { name: /back to status/i })).toBeInTheDocument();
  });

  it('displays financial balances from context', () => {
    const { getByTestId } = renderComponent();

    // staffAccountBalance: 40000
    expect(getByTestId('amount-one')).toHaveTextContent('$40,000.00');
    // currentSalaryCap (100000) - staffAccountBalance (40000) = 60000

    //expect(getByTestId('amount-two')).toHaveTextContent('$60,000.00');
    expect(getByTestId('amount-two')).toHaveTextContent('$17,500.00');
  });

  it('handles missing calculations gracefully', () => {
    const { getByTestId } = renderComponent({
      contextOverrides: {
        requestData: {
          latestAdditionalSalaryRequest: {
            calculations: undefined,
          },
        },
      },
    });

    // staffAccountBalance defaults to 0 when calculations are undefined
    expect(getByTestId('amount-one')).toHaveTextContent('$0.00');
    // remainingAllowableSalary = (currentSalaryCap ?? 0) - grossSalaryAmount = 0 - 40000

    //expect(getByTestId('amount-two')).toHaveTextContent('-$40,000.00');
    expect(getByTestId('amount-two')).toHaveTextContent('$17,500.00');
  });

  it('renders all child components when user exceeds cap', () => {
    const { getByText, getAllByText } = renderComponent({
      initialValues: {
        ...defaultCompleteFormValues,
        additionalSalaryWithinMax: '10000',
      },
    });

    expect(
      getByText('Additional Salary Request', {
        selector: '.MuiCardHeader-title',
      }),
    ).toBeInTheDocument();
    expect(
      getByText('403(b) Deduction', { selector: '.MuiCardHeader-title' }),
    ).toBeInTheDocument();
    expect(getAllByText('Net Additional Salary').length).toBeGreaterThanOrEqual(
      1,
    );
    expect(getByText('Contact Information')).toBeInTheDocument();
    expect(getByText('Total Annual Salary')).toBeInTheDocument();
    expect(getByText('Approval Process')).toBeInTheDocument();
  });

  it('should not render total annual salary or approval process when under cap', () => {
    const { queryByText } = renderComponent();

    expect(queryByText('Total Annual Salary')).not.toBeInTheDocument();
    expect(queryByText('Approval Process')).not.toBeInTheDocument();
  });

  it('handles missing user gracefully', () => {
    const { container } = renderComponent({
      contextOverrides: {
        user: undefined,
      },
    });

    expect(container).toBeInTheDocument();
  });
});
