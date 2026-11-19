import React from 'react';
import { render } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import TestRouter from '__tests__/util/TestRouter';
import {
  HcmQuery,
  useHcmQuery,
} from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
import { MPGAIncomeExpensesReport } from './MPGAIncomeExpensesReport';
import { MPGAIncomeExpensesReportTestWrapper } from './MPGAIncomeExpensesReportTestWrapper';

// Records each Hcm read's options, since Apollo merges the page's reads into one request
jest.mock('src/components/HrTools/Shared/HcmData/Hcm.generated', () => {
  const actual = jest.requireActual(
    'src/components/HrTools/Shared/HcmData/Hcm.generated',
  );
  return { ...actual, useHcmQuery: jest.fn(actual.useHcmQuery) };
});

const mutationSpy = jest.fn();

const hcmPersonNotFound = new GraphQLError('HCM person not found', {
  extensions: { code: 'HCM_PERSON_NOT_FOUND' },
});
const hcmUnavailable = new GraphQLError('HCM UserInfo service unavailable', {
  extensions: { code: 'HCM_UNAVAILABLE' },
});
const notFoundNote =
  "HR no longer has a record for you, so salary isn't split by person on this report.";

const failingHcm = (error: GraphQLError): HcmQuery => ({
  hcm: (() => {
    throw error;
  }) as unknown as HcmQuery['hcm'],
});

interface TestComponentProps {
  hcmError?: GraphQLError;
  staffAccountId?: string;
  personNumber?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  hcmError,
  staffAccountId,
  personNumber,
}) => (
  <TestRouter>
    <MPGAIncomeExpensesReportTestWrapper
      onCall={mutationSpy}
      hcmMocks={hcmError ? failingHcm(hcmError) : undefined}
      staffAccountId={staffAccountId}
      personNumber={personNumber}
    >
      <MPGAIncomeExpensesReport
        onNavListToggle={jest.fn()}
        isNavListOpen={true}
        title="MPGA Report"
      />
    </MPGAIncomeExpensesReportTestWrapper>
  </TestRouter>
);

// Role+name lookups walk every node of a page holding several data grids and
// cost seconds each, so match the cell text directly instead.
const inGridCell = { selector: '[role="gridcell"] *' };

beforeAll(() => {
  window.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
});

describe('MPGAIncomeExpensesReport HCM handling', () => {
  describe('when HCM has no record of the person', () => {
    it('loads the report with no error', async () => {
      const { findByText, queryByRole } = render(
        <TestComponent hcmError={hcmPersonNotFound} />,
      );

      expect(await findByText('Benefits', inGridCell)).toBeVisible();
      expect(queryByRole('alert')).not.toBeInTheDocument();
    });

    it('notes that salary is not split by person', async () => {
      const { findByRole } = render(
        <TestComponent hcmError={hcmPersonNotFound} />,
      );

      expect(await findByRole('status')).toHaveTextContent(notFoundNote);
    });

    it('names the staff member rather than you in supervisor view', async () => {
      const { findByText, queryByText } = render(
        <TestComponent
          staffAccountId="1000000001"
          personNumber="000000111"
          hcmError={hcmPersonNotFound}
        />,
      );

      expect(
        await findByText(
          "HR no longer has a record for this person, so salary isn't split by person on this report.",
        ),
      ).toBeInTheDocument();
      expect(queryByText(notFoundNote)).not.toBeInTheDocument();
    });

    it('passes the handled codes to every Hcm read', async () => {
      const { findByText } = render(
        <TestComponent hcmError={hcmPersonNotFound} />,
      );

      await findByText('Benefits', inGridCell);
      expect(mutationSpy).toHaveGraphqlOperation('Hcm');
      mutationSpy.mock.calls
        .filter(([{ operation }]) => operation.operationName === 'Hcm')
        .forEach(([{ operation }]) =>
          expect(operation.getContext().suppressErrorCodes).toEqual([
            'HCM_PERSON_NOT_FOUND',
          ]),
        );
      // The merged request carries whichever read's context started it, so every read needs it
      const hcmReads = jest.mocked(useHcmQuery).mock.calls;
      expect(hcmReads.length).toBeGreaterThan(0);
      hcmReads.forEach(([options]) =>
        expect(options?.context?.suppressErrorCodes).toEqual([
          'HCM_PERSON_NOT_FOUND',
        ]),
      );
    });
  });

  it('still loads the report when HCM is unavailable', async () => {
    const { findByText, queryByText } = render(
      <TestComponent hcmError={hcmUnavailable} />,
    );

    expect(await findByText('Benefits', inGridCell)).toBeVisible();
    expect(queryByText(notFoundNote)).not.toBeInTheDocument();
  });

  it('shows no HR record note when HCM loads', async () => {
    const { findByText, queryByText } = render(<TestComponent />);

    expect(await findByText('Benefits', inGridCell)).toBeVisible();
    expect(queryByText(notFoundNote)).not.toBeInTheDocument();
  });
});
