import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import {
  AdditionalSalaryRequestContext,
  AdditionalSalaryRequestType,
} from '../Shared/AdditionalSalaryRequestContext';
import { SpouseComponent } from './SpouseComponent';

const requestDataDefault = {
  latestAdditionalSalaryRequest: {
    calculations: {
      currentSalaryCap: 1000,
      staffAccountBalance: 200,
    },
    spouseCalculations: {
      currentSalaryCap: 10000,
      staffAccountBalance: 3000,
    },
  },
};

const spouseDefault = {
  staffInfo: {
    firstName: 'Jane',
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
};
const renderComponent = ({
  requestData = requestDataDefault,
  spouse = spouseDefault,
  isSpouse = false,
}: ComponentProps) =>
  render(
    <TestRouter router={router}>
      <AdditionalSalaryRequestContext.Provider
        value={
          {
            requestData,
            spouse,
            isSpouse,
          } as unknown as AdditionalSalaryRequestType
        }
      >
        <SpouseComponent />
      </AdditionalSalaryRequestContext.Provider>
    </TestRouter>,
  );

describe('SpouseComponent', () => {
  it('renders the request additional salary link with spouse name', () => {
    const { getByText } = renderComponent({});

    expect(getByText('Request additional salary for Jane')).toBeInTheDocument();
  });

  it('displays the remaining allowable salary amount', () => {
    const { getByText } = renderComponent({});

    expect(
      getByText('Up to their remaining allowable salary of $7,000'),
    ).toBeInTheDocument();
  });

  it('calculates remaining salary correctly when values are provided', () => {
    const { getByText } = renderComponent({
      requestData: {
        latestAdditionalSalaryRequest: {
          ...requestDataDefault.latestAdditionalSalaryRequest,
          spouseCalculations: {
            currentSalaryCap: 15000,
            staffAccountBalance: 5000,
          },
        },
      },
    });

    expect(
      getByText('Up to their remaining allowable salary of $10,000'),
    ).toBeInTheDocument();
  });

  it('handles null spouse calculations gracefully', () => {
    const { getByText } = renderComponent({
      requestData: {
        latestAdditionalSalaryRequest: {
          ...requestDataDefault.latestAdditionalSalaryRequest,
          spouseCalculations: null,
        },
      },
    });

    expect(
      getByText('Up to their remaining allowable salary of $0'),
    ).toBeInTheDocument();
  });

  it('handles missing spouse name gracefully', () => {
    const { getByText } = renderComponent({
      spouse: {
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

  describe('isSpouse=true', () => {
    it('shows "Switch back to" link text when isSpouse is true', () => {
      const { getByText } = renderComponent({ isSpouse: true });

      expect(getByText('Switch back to Jane')).toBeInTheDocument();
    });

    it('uses userCalculations for remaining salary when isSpouse is true', () => {
      const { getByText } = renderComponent({ isSpouse: true });

      expect(
        getByText('Up to their remaining allowable salary of $800'),
      ).toBeInTheDocument();
    });

    it('generates correct link URL when isSpouse is true (no query param)', () => {
      const { getByRole } = renderComponent({ isSpouse: true });
      const link = getByRole('link', { name: /Switch back to Jane/ });

      expect(link).toHaveAttribute(
        'href',
        '/accountLists/account-list-1/reports/additionalSalaryRequest',
      );
    });

    it('generates correct link URL when isSpouse is false (with query param)', () => {
      const { getByRole } = renderComponent({ isSpouse: false });
      const link = getByRole('link', {
        name: /Request additional salary for Jane/,
      });

      expect(link).toHaveAttribute(
        'href',
        '/accountLists/account-list-1/reports/additionalSalaryRequest?isSpouse=true',
      );
    });
  });
});
