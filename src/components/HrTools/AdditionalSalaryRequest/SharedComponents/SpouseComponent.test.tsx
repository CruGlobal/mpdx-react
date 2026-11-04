import { render } from '@testing-library/react';
import { Formik } from 'formik';
import TestRouter from '__tests__/util/TestRouter';
import {
  AdditionalSalaryRequestContext,
  AdditionalSalaryRequestType,
} from '../Shared/AdditionalSalaryRequestContext';
import { defaultCompleteFormValues } from '../Shared/CompleteForm.mock';
import { SpouseComponent } from './SpouseComponent';

const requestDataDefault = {
  latestAdditionalSalaryRequest: {
    calculations: {
      currentSalaryCap: 50000,
      grossAnnualSalary: 30000,
      ytdAsrAmount: 2000,
      staffAccountBalance: 200,
    },
    spouseCalculations: {
      currentSalaryCap: 60000,
      grossAnnualSalary: 45000,
      ytdAsrAmount: 5000,
      staffAccountBalance: 3000,
      // Differs from cap - gross - ytd ($10,000) so the specs prove the API is the source
      remainingAllowableSalary: 9000,
    },
  },
};

const spouseDefault = {
  asrEit: { asrEligibility: true },
  staffInfo: {
    preferredName: 'Jane',
    primaryPhoneNumber: '555-1234',
    emailAddress: 'jane@example.com',
  },
};

const router = {
  query: { accountListId: 'account-list-1' },
  isReady: true,
  push: jest.fn(),
};

type ComponentProps = {
  requestData?: object;
  spouse?: object;
  isSpouse?: boolean;
  hasSpouse?: boolean;
};
const renderComponent = ({
  requestData = requestDataDefault,
  spouse = spouseDefault,
  isSpouse = false,
  hasSpouse = true,
}: ComponentProps) =>
  render(
    <TestRouter router={router}>
      <AdditionalSalaryRequestContext.Provider
        value={
          {
            requestData,
            spouse,
            isSpouse,
            hasSpouse,
          } as unknown as AdditionalSalaryRequestType
        }
      >
        <Formik initialValues={defaultCompleteFormValues} onSubmit={jest.fn()}>
          <SpouseComponent />
        </Formik>
      </AdditionalSalaryRequestContext.Provider>
    </TestRouter>,
  );

describe('SpouseComponent', () => {
  it('renders the request additional salary link with spouse name', () => {
    const { getByText } = renderComponent({});

    expect(getByText('Request additional salary for Jane')).toBeInTheDocument();
  });

  const renderWithSpouseCalculations = (spouseCalculations: object | null) =>
    renderComponent({
      requestData: {
        latestAdditionalSalaryRequest: {
          ...requestDataDefault.latestAdditionalSalaryRequest,
          spouseCalculations,
        },
      },
    });

  it('displays the remaining allowable salary amount from the API', () => {
    const { getByText } = renderComponent({});

    expect(
      getByText('Up to their remaining allowable salary of $9,000'),
    ).toBeInTheDocument();
  });

  // MPDX-10269: the spouse figure must follow the API after the spouse's own requests
  it('shows the API amount when the spouse has a paid request this year', () => {
    const { getByText } = renderWithSpouseCalculations({
      currentSalaryCap: 60000,
      grossAnnualSalary: 40000,
      ytdAsrAmount: 12000,
      remainingAllowableSalary: 7500,
    });

    expect(
      getByText('Up to their remaining allowable salary of $7,500'),
    ).toBeInTheDocument();
  });

  it('shows the API amount when the spouse has a pending request', () => {
    const { getByText } = renderWithSpouseCalculations({
      currentSalaryCap: 60000,
      grossAnnualSalary: 40000,
      ytdAsrAmount: 3000,
      remainingAllowableSalary: 15000,
    });

    expect(
      getByText('Up to their remaining allowable salary of $15,000'),
    ).toBeInTheDocument();
  });

  it('displays $0 when the API says the spouse has no room left', () => {
    const { getByText } = renderWithSpouseCalculations({
      currentSalaryCap: 40000,
      grossAnnualSalary: 45000,
      ytdAsrAmount: 5000,
      remainingAllowableSalary: 0,
    });

    expect(
      getByText('Up to their remaining allowable salary of $0'),
    ).toBeInTheDocument();
  });

  it('hides the amount but keeps the link when spouse calculations are null', () => {
    const { getByText, queryByText } = renderWithSpouseCalculations(null);

    expect(getByText('Request additional salary for Jane')).toBeInTheDocument();
    expect(
      queryByText(/Up to their remaining allowable salary/),
    ).not.toBeInTheDocument();
  });

  it('hides the amount but keeps the link when the API has no remaining amount', () => {
    const { getByText, queryByText } = renderWithSpouseCalculations({
      currentSalaryCap: null,
      grossAnnualSalary: 45000,
      ytdAsrAmount: 5000,
      remainingAllowableSalary: null,
    });

    expect(getByText('Request additional salary for Jane')).toBeInTheDocument();
    expect(
      queryByText(/Up to their remaining allowable salary/),
    ).not.toBeInTheDocument();
  });

  it('shows the same figure as the split footer, so no caption without a spouse cap', () => {
    const { getByText, queryByText } = renderWithSpouseCalculations({
      currentSalaryCap: null,
      grossAnnualSalary: 45000,
      ytdAsrAmount: 5000,
      remainingAllowableSalary: 5000,
    });

    expect(getByText('Request additional salary for Jane')).toBeInTheDocument();
    expect(
      queryByText(/Up to their remaining allowable salary/),
    ).not.toBeInTheDocument();
  });

  it('handles missing spouse name gracefully', () => {
    const { getByText } = renderComponent({
      spouse: {
        ...spouseDefault,
        staffInfo: {
          preferredName: null,
        },
      },
    });

    expect(getByText('Request additional salary for')).toBeInTheDocument();
  });

  it('renders the import/export icon', () => {
    const { getByTestId } = renderComponent({});

    expect(getByTestId('ImportExportIcon')).toBeInTheDocument();
  });

  it('does not render when user has no spouse', () => {
    const { queryByText, queryByTestId } = renderComponent({
      spouse: undefined,
      hasSpouse: false,
    });

    expect(
      queryByText(/Request additional salary for/),
    ).not.toBeInTheDocument();
    expect(queryByTestId('ImportExportIcon')).not.toBeInTheDocument();
  });

  describe('isSpouse=true', () => {
    it('shows "Switch back to" link text when isSpouse is true', () => {
      const { getByText } = renderComponent({ isSpouse: true });

      expect(getByText('Switch back to Jane')).toBeInTheDocument();
    });

    // On the spouse's page, calculations is the spouse and spouseCalculations is the user being switched back to
    it('uses spouseCalculations for remaining salary when isSpouse is true', () => {
      const { getByText } = renderComponent({ isSpouse: true });

      expect(
        getByText('Up to their remaining allowable salary of $9,000'),
      ).toBeInTheDocument();
    });

    it('generates correct link URL when isSpouse is true (no query param)', () => {
      const { getByRole } = renderComponent({ isSpouse: true });
      const link = getByRole('link', { name: /Switch back to Jane/ });

      expect(link).toHaveAttribute(
        'href',
        '/accountLists/account-list-1/hrTools/additionalSalaryRequest',
      );
    });

    it('generates correct link URL when isSpouse is false (with query param)', () => {
      const { getByRole } = renderComponent({ isSpouse: false });
      const link = getByRole('link', {
        name: /Request additional salary for Jane/,
      });

      expect(link).toHaveAttribute(
        'href',
        '/accountLists/account-list-1/hrTools/additionalSalaryRequest?isSpouse=true',
      );
    });
  });
});
