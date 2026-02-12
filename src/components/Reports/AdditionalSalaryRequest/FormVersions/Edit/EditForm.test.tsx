import { defaultCompleteFormValues } from '../../Shared/CompleteForm.mock';
import { createRenderFormComponent, setupMockContext } from '../testUtils';
import { EditForm } from './EditForm';

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
  EditForm,
  mockUseAdditionalSalaryRequest,
);

describe('EditForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page with user info', () => {
    const { getByText } = renderComponent();

    expect(getByText('Edit Your Request')).toBeInTheDocument();
    expect(getByText('Doe, John')).toBeInTheDocument();
    expect(getByText('00123456')).toBeInTheDocument();
  });

  it('displays financial balances from context', () => {
    const { getByTestId } = renderComponent();

    // staffAccountBalance: 40000
    expect(getByTestId('amount-one')).toHaveTextContent('$40,000.00');
    // currentSalaryCap: value in backend
    expect(getByTestId('amount-two')).toHaveTextContent('$100,000.00');
  });

  it('handles missing calculations gracefully', () => {
    const { getByTestId } = renderComponent({
      contextOverrides: {
        requestData: {
          latestAdditionalSalaryRequest: {
            calculations: {
              currentSalaryCap: -40000,
            },
          },
        },
      },
    });

    // staffAccountBalance defaults to 0 when calculations are undefined
    expect(getByTestId('amount-one')).toHaveTextContent('$0.00');
    // currentSalaryCap calculation done in backend
    expect(getByTestId('amount-two')).toHaveTextContent('-$40,000.00');
  });

  it('renders all child components when user exceeds cap', () => {
    const { getByText, getAllByText } = renderComponent({
      initialValues: {
        ...defaultCompleteFormValues,
        additionalSalaryWithinMax: '200000',
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
    expect(getAllByText('Telephone Number').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Email Address').length).toBeGreaterThanOrEqual(1);
    expect(getByText('Total Salary Requested')).toBeInTheDocument();
  });

  it('should not render cap-related components when user does not exceed cap', () => {
    const { queryByText } = renderComponent();

    expect(queryByText('Total Salary Requested')).not.toBeInTheDocument();
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
