import { render } from '@testing-library/react';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { SpouseComponent } from './SpouseComponent';

jest.mock('../Shared/AdditionalSalaryRequestContext', () => ({
  ...jest.requireActual('../Shared/AdditionalSalaryRequestContext'),
  useAdditionalSalaryRequest: jest.fn(),
}));

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

const mockContextValue = {
  requestData: {
    latestAdditionalSalaryRequest: {
      spouseCalculations: {
        currentSalaryCap: 10000,
        staffAccountBalance: 3000,
      },
    },
  },
  spouse: {
    staffInfo: {
      preferredName: 'Jane',
    },
  },
  accountListId: 'account-list-1',
  requestId: 'request-123',
  handleDeleteRequest: jest.fn(),
  setRequestId: jest.fn(),
  refetch: jest.fn(),
  loading: false,
};

describe('SpouseComponent', () => {
  beforeEach(() => {
    mockUseAdditionalSalaryRequest.mockReturnValue(
      mockContextValue as unknown as ReturnType<
        typeof useAdditionalSalaryRequest
      >,
    );
  });

  it('renders the request additional salary link with spouse name', () => {
    const { getByText } = render(<SpouseComponent />);

    expect(
      getByText('Request additional salary from Jane'),
    ).toBeInTheDocument();
  });

  it('displays the remaining allowable salary amount', () => {
    const { getByText } = render(<SpouseComponent />);

    expect(
      getByText('Up to her remaining allowable salary of $7,000'),
    ).toBeInTheDocument();
  });

  it('calculates remaining salary correctly when values are provided', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...mockContextValue,
      requestData: {
        latestAdditionalSalaryRequest: {
          spouseCalculations: {
            currentSalaryCap: 15000,
            staffAccountBalance: 5000,
          },
        },
      },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { getByText } = render(<SpouseComponent />);

    expect(
      getByText('Up to her remaining allowable salary of $10,000'),
    ).toBeInTheDocument();
  });

  it('handles null spouse calculations gracefully', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...mockContextValue,
      requestData: {
        latestAdditionalSalaryRequest: {
          spouseCalculations: null,
        },
      },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { getByText } = render(<SpouseComponent />);

    expect(
      getByText('Up to her remaining allowable salary of $0'),
    ).toBeInTheDocument();
  });

  it('handles missing spouse name gracefully', () => {
    mockUseAdditionalSalaryRequest.mockReturnValue({
      ...mockContextValue,
      spouse: {
        staffInfo: {
          preferredName: null,
        },
      },
    } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

    const { getByText } = render(<SpouseComponent />);

    expect(getByText('Request additional salary from')).toBeInTheDocument();
  });

  it('renders the import/export icon', () => {
    const { getByTestId } = render(<SpouseComponent />);

    expect(getByTestId('ImportExportIcon')).toBeInTheDocument();
  });
});
