import { missingValue } from '../../../Shared/helpers/missingValue';
import { defaultCompleteFormValues } from '../../Shared/CompleteForm.mock';
import {
  createRenderFormComponent,
  defaultMockContextValue,
  openAvailableBalanceTooltip,
  setupMockContext,
} from '../testUtils';
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
  });

  it('shows a three-column skeleton until HCM loads', () => {
    const { getAllByTestId, queryByTestId } = renderComponent({
      contextOverrides: { hcmLoading: true },
    });

    expect(getAllByTestId('name-display-skeleton-column')).toHaveLength(3);
    expect(queryByTestId('amount-three')).not.toBeInTheDocument();
  });

  it('displays financial balances from context', () => {
    const { getByTestId } = renderComponent();

    // availableStaffAccountBalance, not the raw staffAccountBalance of 40000
    expect(getByTestId('amount-one')).toHaveTextContent('$30,000.00');
    // currentSalaryCap: value in backend
    expect(getByTestId('amount-two')).toHaveTextContent('$100,000.00');
    // remainingAllowableSalary from the API
    expect(getByTestId('amount-three')).toHaveTextContent('$55,000.00');
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
        calculations: {
          currentSalaryCap: -40000,
        },
      },
    });

    // availableStaffAccountBalance defaults to 0 when calculations are undefined
    expect(getByTestId('amount-one')).toHaveTextContent('$0.00');
    // currentSalaryCap calculation done in backend
    expect(getByTestId('amount-two')).toHaveTextContent('-$40,000.00');
    // remainingAllowableSalary shows a dash when the API leaves it out
    expect(getByTestId('amount-three')).toHaveTextContent(missingValue);
  });

  it('explains the available amount in a tooltip beside its label', async () => {
    const utils = renderComponent();

    expect(utils.queryByText(/Primary balance/)).not.toBeInTheDocument();
    const tooltip = await openAvailableBalanceTooltip(utils);
    expect(tooltip).toHaveTextContent(
      'Primary balance of $40,000.00, minus $10,000.00 in other unpaid requests',
    );
    expect(tooltip).toHaveTextContent(
      "Your spouse's request, waiting for approval: $10,000.00",
    );
  });

  it('shows the approval note inside the card, under the amounts', () => {
    const { getByText, getByTestId } = renderComponent();

    const note = getByText(
      /Requests over \$55,000\.00 \(your remaining allowable salary\) need approval/,
    );
    expect(note.closest('.MuiCard-root')).toContainElement(
      getByTestId('amount-one'),
    );
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

  it('shows the missing location alert when the cap has no location', async () => {
    const { findByText } = renderComponent({
      contextOverrides: {
        calculations: {
          ...defaultMockContextValue.calculations,
          geographicLocation: null,
        },
      },
    });

    expect(
      await findByText(
        /Your cap may be inaccurate because your location isn't set/,
      ),
    ).toBeInTheDocument();
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
