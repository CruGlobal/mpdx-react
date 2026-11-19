import { missingValue } from '../../../Shared/helpers/missingValue';
import { defaultCompleteFormValues } from '../../Shared/CompleteForm.mock';
import {
  combinedCapOverrides,
  combinedCapValues,
  createRenderFormComponent,
  defaultMockContextValue,
  openAvailableBalanceTooltip,
  setupMockContext,
} from '../testUtils';
import { NewForm } from './NewForm';

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
  NewForm,
  mockUseAdditionalSalaryRequest,
);

describe('NewForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders user name and account number', () => {
      const { getByText } = renderComponent();

      expect(getByText('Doe, John')).toBeInTheDocument();
    });

    it('renders instructional text and notes', () => {
      const { getByText, getAllByText } = renderComponent();

      expect(
        getByText(/Please enter the desired dollar amounts/i),
      ).toBeInTheDocument();
      expect(getAllByText('Note:').length).toBeGreaterThanOrEqual(1);
      expect(
        getByText(/If the above information is correct/i),
      ).toBeInTheDocument();
    });
  });

  describe('financial calculations', () => {
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

    it('displays correct account balances from request data', () => {
      const { getByTestId } = renderComponent();

      // availableStaffAccountBalance, not the raw staffAccountBalance of 40000
      expect(getByTestId('amount-one')).toHaveTextContent('$30,000.00');
      // currentSalaryCap: value on backend
      expect(getByTestId('amount-two')).toHaveTextContent('$100,000.00');
      // remainingAllowableSalary from the API
      expect(getByTestId('amount-three')).toHaveTextContent('$55,000.00');
    });

    it('shows a three-column skeleton until HCM loads', () => {
      const { getAllByTestId, queryByTestId } = renderComponent({
        contextOverrides: { hcmLoading: true },
      });

      expect(getAllByTestId('name-display-skeleton-column')).toHaveLength(3);
      expect(queryByTestId('amount-three')).not.toBeInTheDocument();
    });

    it('handles missing calculations data gracefully', () => {
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

      expect(getByTestId('amount-one')).toHaveTextContent('$0.00');
      // currentSalaryCap calculated in backend
      expect(getByTestId('amount-two')).toHaveTextContent('-$40,000.00');
      // remainingAllowableSalary shows a dash when the API leaves it out
      expect(getByTestId('amount-three')).toHaveTextContent(missingValue);
    });
  });

  describe('user information', () => {
    it('handles missing user name gracefully', () => {
      const { queryByText } = renderComponent({
        contextOverrides: {
          user: {
            ...defaultMockContextValue.user,
            staffInfo: {
              ...defaultMockContextValue.user.staffInfo,
              preferredName: '',
            },
          },
        },
      });

      expect(queryByText('Doe, John')).not.toBeInTheDocument();
    });

    it('handles undefined user gracefully', () => {
      const { container } = renderComponent({
        contextOverrides: {
          user: undefined,
        },
      });

      expect(container).toBeInTheDocument();
    });
  });

  describe('child components', () => {
    it('renders all form sections', () => {
      const { getByText, getAllByText } = renderComponent();

      expect(
        getByText('Additional Salary Request', {
          selector: '.MuiCardHeader-title',
        }),
      ).toBeInTheDocument();
      expect(
        getByText('403(b) Deduction', { selector: '.MuiCardHeader-title' }),
      ).toBeInTheDocument();
      expect(
        getAllByText('Net Additional Salary').length,
      ).toBeGreaterThanOrEqual(1);
    });

    it('renders exceeded cap components', () => {
      const { getByText } = renderComponent({
        initialValues: {
          ...defaultCompleteFormValues,
          additionalSalaryWithinMax: '200000',
        },
      });

      expect(getByText('Total Salary Requested')).toBeInTheDocument();
      expect(getByText('Approval Process')).toBeInTheDocument();
    });

    it("asks for approval past the API's threshold even under the own cap", () => {
      const { getByText, queryByText } = renderComponent({
        initialValues: combinedCapValues,
        contextOverrides: combinedCapOverrides,
      });

      expect(getByText('Approval Process')).toBeInTheDocument();
      expect(queryByText('Total Salary Requested')).not.toBeInTheDocument();
    });

    it('does not render exceeded cap components when not exceeded', () => {
      const { queryByText } = renderComponent();

      expect(queryByText('Total Salary Requested')).not.toBeInTheDocument();
      expect(queryByText('Approval Process')).not.toBeInTheDocument();
    });

    it('renders ContactInformation with email and phone fields', () => {
      const { getAllByText } = renderComponent();

      expect(getAllByText('Email Address').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('Telephone Number').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('missing location alert', () => {
    it('shows the alert when the cap has no location', async () => {
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
  });

  describe('validation alert', () => {
    it('does not show alert initially', () => {
      const { queryByRole } = renderComponent();

      expect(queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
