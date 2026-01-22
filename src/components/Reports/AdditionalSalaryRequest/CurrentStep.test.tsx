import { render } from '@testing-library/react';
import { AdditionalSalaryRequestSectionEnum } from './AdditionalSalaryRequestHelper';
import { CurrentStep } from './CurrentStep';
import { useAdditionalSalaryRequest } from './Shared/AdditionalSalaryRequestContext';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));
jest.mock('src/hooks/useAccountListId', () => ({
  useAccountListId: () => 'account-list-1',
}));
jest.mock('./Shared/AdditionalSalaryRequestContext');
jest.mock('./AboutForm/AboutForm', () => ({
  AboutForm: () => <div data-testid="about-form">AboutForm</div>,
}));
jest.mock('./CompleteForm/CompleteForm', () => ({
  CompleteForm: () => <div data-testid="complete-form">CompleteForm</div>,
}));
jest.mock('../Shared/CalculationReports/ReceiptStep/Receipt', () => ({
  Receipt: () => <div data-testid="receipt">Receipt</div>,
}));
jest.mock('./SharedComponents/AdditionalSalaryRequestSection', () => ({
  AdditionalSalaryRequestSection: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="asr-section">{children}</div>
  ),
}));

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
  requestsError: undefined,
  pageType: undefined,
  handleDeleteRequest: jest.fn(),
  requestId: undefined,
  user: undefined,
  spouse: undefined,
  isMutating: false,
  trackMutation: jest.fn(),
};

describe('CurrentStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders AboutForm when currentStep is AboutForm', () => {
    (useAdditionalSalaryRequest as jest.Mock).mockReturnValue({
      ...mockContextValue,
      currentStep: AdditionalSalaryRequestSectionEnum.AboutForm,
    });

    const { getByTestId } = render(<CurrentStep />);

    expect(getByTestId('about-form')).toBeInTheDocument();
  });

  it('renders CompleteForm when currentStep is CompleteForm', () => {
    (useAdditionalSalaryRequest as jest.Mock).mockReturnValue({
      ...mockContextValue,
      currentStep: AdditionalSalaryRequestSectionEnum.CompleteForm,
    });

    const { getByTestId } = render(<CurrentStep />);

    expect(getByTestId('complete-form')).toBeInTheDocument();
  });

  it('renders Receipt when currentStep is Receipt', () => {
    (useAdditionalSalaryRequest as jest.Mock).mockReturnValue({
      ...mockContextValue,
      currentStep: AdditionalSalaryRequestSectionEnum.Receipt,
    });

    const { getByTestId } = render(<CurrentStep />);

    expect(getByTestId('receipt')).toBeInTheDocument();
  });
});
