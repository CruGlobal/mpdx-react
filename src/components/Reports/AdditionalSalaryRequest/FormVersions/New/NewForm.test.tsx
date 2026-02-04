import {
  createRenderFormComponent,
  defaultMockContextValue,
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
      expect(getByText('00123456')).toBeInTheDocument();
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
    it('displays correct account balances from request data', () => {
      const { getByTestId } = renderComponent();

      expect(getByTestId('amount-one')).toHaveTextContent('$40,000.00');
      // currentSalaryCap (100000) - grossSalaryAmount (40000) = 60000
      expect(getByTestId('amount-two')).toHaveTextContent('$60,000.00');
    });

    it('handles missing calculations data gracefully', () => {
      const { getByTestId } = renderComponent({
        contextOverrides: {
          requestData: {
            latestAdditionalSalaryRequest: {
              calculations: undefined,
            },
          },
        },
      });

      expect(getByTestId('amount-one')).toHaveTextContent('$0.00');
      // remainingAllowableSalary = (currentSalaryCap ?? 0) - grossSalaryAmount = 0 - 40000
      expect(getByTestId('amount-two')).toHaveTextContent('-$40,000.00');
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

    it('renders ContactInformation with email and phone fields', () => {
      const { getAllByText } = renderComponent();

      expect(getAllByText('Email').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('Telephone Number').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('validation alert', () => {
    it('does not show alert initially', () => {
      const { queryByRole } = renderComponent();

      expect(queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
