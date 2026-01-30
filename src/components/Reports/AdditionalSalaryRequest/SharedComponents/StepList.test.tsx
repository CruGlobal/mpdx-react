import { render, waitFor } from '@testing-library/react';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';
import { AdditionalSalaryRequestTestWrapper } from '../AdditionalSalaryRequestTestWrapper';
import { EditForm } from '../FormVersions/Edit/EditForm';
import { NewForm } from '../FormVersions/New/NewForm';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { StepList } from './StepList';

jest.mock('../Shared/AdditionalSalaryRequestContext', () => ({
  ...jest.requireActual('../Shared/AdditionalSalaryRequestContext'),
  useAdditionalSalaryRequest: jest.fn(),
}));

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

const mockContextValue = {
  staffAccountId: 'staff-1',
  staffAccountIdLoading: false,
  steps: [],
  currentIndex: 0,
  currentStep: AdditionalSalaryRequestSectionEnum.AboutForm,
  handleNextStep: jest.fn(),
  handlePreviousStep: jest.fn(),
  isDrawerOpen: false,
  toggleDrawer: jest.fn(),
  requestsData: null,
  requestData: null,
  requestsError: undefined,
  pageType: undefined,
  handleDeleteRequest: jest.fn(),
  requestId: undefined,
  user: undefined,
  spouse: undefined,
  salaryInfo: undefined,
  isInternational: false,
  isMutating: false,
  trackMutation: jest.fn(),
  loading: false,
};

describe('StepList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('with NewForm', () => {
    const TestComponent: React.FC = () => (
      <AdditionalSalaryRequestTestWrapper>
        <StepList FormComponent={NewForm} />
      </AdditionalSalaryRequestTestWrapper>
    );

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

    it('renders NewForm when currentIndex is 1', async () => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        ...mockContextValue,
        currentIndex: 1,
      });

      const { getByText } = render(<TestComponent />);

      await waitFor(() =>
        expect(getByText('Additional Salary Request')).toBeInTheDocument(),
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

  describe('with EditForm', () => {
    const TestComponent: React.FC = () => (
      <AdditionalSalaryRequestTestWrapper pageType="edit">
        <StepList FormComponent={EditForm} />
      </AdditionalSalaryRequestTestWrapper>
    );

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

    it('renders EditForm when currentIndex is 1', async () => {
      mockUseAdditionalSalaryRequest.mockReturnValue({
        ...mockContextValue,
        currentIndex: 1,
      });

      const { getByText } = render(<TestComponent />);

      await waitFor(() =>
        expect(getByText('Edit Your Request')).toBeInTheDocument(),
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

  it('renders null when currentIndex is out of bounds', async () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...mockContextValue,
      currentIndex: 99,
    });

    const { queryByText } = render(
      <AdditionalSalaryRequestTestWrapper>
        <StepList FormComponent={NewForm} />
      </AdditionalSalaryRequestTestWrapper>,
    );

    expect(queryByText('About this Form')).not.toBeInTheDocument();
    expect(queryByText('Complete the Form')).not.toBeInTheDocument();
    expect(
      queryByText('Thank you for Submitting your Additional Salary Request!'),
    ).not.toBeInTheDocument();
  });
});
