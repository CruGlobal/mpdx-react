import { render, waitFor } from '@testing-library/react';
import { AdditionalSalaryRequestSectionEnum } from './AdditionalSalaryRequestHelper';
import { AdditionalSalaryRequestTestWrapper } from './AdditionalSalaryRequestTestWrapper';
import { CurrentStep } from './CurrentStep';
import { useAdditionalSalaryRequest } from './Shared/AdditionalSalaryRequestContext';

jest.mock('./Shared/AdditionalSalaryRequestContext', () => ({
  ...jest.requireActual('./Shared/AdditionalSalaryRequestContext'),
  useAdditionalSalaryRequest: jest.fn(),
}));

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

const mockContextValue = {
  staffAccountId: 'staff-1',
  steps: [],
  currentIndex: 0,
  currentStep: AdditionalSalaryRequestSectionEnum.AboutForm,
  handleNextStep: jest.fn(),
  handlePreviousStep: jest.fn(),
  isDrawerOpen: false,
  toggleDrawer: jest.fn(),
  requestsData: null,
  requestData: null,
  loading: false,
  requestsError: undefined,
  pageType: undefined,
  handleDeleteRequest: jest.fn(),
  requestId: undefined,
  user: undefined,
  spouse: undefined,
  isMutating: false,
  trackMutation: jest.fn(),
};

const TestComponent: React.FC = () => (
  <AdditionalSalaryRequestTestWrapper>
    <CurrentStep />
  </AdditionalSalaryRequestTestWrapper>
);

describe('CurrentStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders AboutForm when currentIndex is 0', async () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...mockContextValue,
      currentIndex: 0,
    });

    const { getByText } = render(<TestComponent />);

    await waitFor(() =>
      expect(getByText('About this Form')).toBeInTheDocument(),
    );
  });

  it('renders CompleteForm when currentIndex is 1', async () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...mockContextValue,
      currentIndex: 1,
    });

    const { getByText } = render(<TestComponent />);

    await waitFor(() =>
      expect(getByText('Complete the Form')).toBeInTheDocument(),
    );
  });

  it('renders Receipt when currentIndex is 2', async () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...mockContextValue,
      currentIndex: 2,
    });

    const { getByText } = render(<TestComponent />);

    await waitFor(() =>
      expect(
        getByText('Thank you for Submitting your Additional Salary Request!'),
      ).toBeInTheDocument(),
    );
  });
});
