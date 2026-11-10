import React from 'react';
import { ApolloError } from '@apollo/client';
import { render } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import i18n from 'src/lib/i18n';
import { useEffectiveDateOptions } from '../EffectiveDateStep/useEffectiveDateOptions';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import {
  MhaEndPerson,
  MhaEndReasonEnum,
  MhaEndWarning,
  mhaEndFromError,
} from './MhaEndWarning';

const jane: MhaEndPerson = {
  personNumber: '100001',
  name: 'Jane Doe',
  reason: MhaEndReasonEnum.ZeroAmount,
};
const john: MhaEndPerson = {
  personNumber: '100002',
  name: 'John Doe',
  reason: MhaEndReasonEnum.NoHousingType,
};

const apolloError = (extensions: Record<string, unknown>) =>
  new ApolloError({
    graphQLErrors: [new GraphQLError('Request failed', { extensions })],
  });

describe('mhaEndFromError', () => {
  it('returns null for an error that did not come from Apollo', () => {
    expect(mhaEndFromError(new Error('Network down'))).toBeNull();
  });

  it('returns null for an Apollo error with another code', () => {
    expect(
      mhaEndFromError(apolloError({ code: 'INTERNAL_SERVER_ERROR' })),
    ).toBeNull();
  });

  it('returns each person the request would end MHA for and the date the server checked', () => {
    expect(
      mhaEndFromError(
        apolloError({
          code: 'MHA_WOULD_END',
          effectiveDate: '2026-11-16',
          people: [
            { ...jane, currentTakenAmount: 12000 },
            { ...john, currentTakenAmount: 7200 },
          ],
        }),
      ),
    ).toEqual({ people: [jane, john], effectiveDate: '2026-11-16' });
  });

  it('keeps the warning but skips what it cannot read', () => {
    expect(
      mhaEndFromError(
        apolloError({
          code: 'MHA_WOULD_END',
          effectiveDate: 20261116,
          people: [{ name: 'No Person Number' }, 'Jane Doe', jane],
        }),
      ),
    ).toEqual({ people: [jane], effectiveDate: null });
    expect(mhaEndFromError(apolloError({ code: 'MHA_WOULD_END' }))).toEqual({
      people: [],
      effectiveDate: null,
    });
  });
});

describe('MhaEndWarning', () => {
  it('says when and why each person stops getting MHA', async () => {
    const { findByText, getByText } = render(
      <SalaryCalculatorTestWrapper
        salaryRequestMock={{ effectiveDate: '2026-11-16' }}
        payrollDates={[
          { startDate: '2026-11-16', regularProcessDate: '2026-11-25' },
        ]}
      >
        <MhaEndWarning people={[jane, john]} effectiveDate="2026-11-16" />
      </SalaryCalculatorTestWrapper>,
    );

    expect(
      await findByText(
        "Jane Doe won't get MHA starting with the paycheck on 11/25/2026. This request sets their MHA to $0.",
      ),
    ).toBeInTheDocument();
    expect(
      getByText(
        "John Doe won't get MHA starting with the paycheck on 11/25/2026. They do not have a current board approval for MHA.",
      ),
    ).toBeInTheDocument();
  });

  it('dates the warning from the date the server checked, not the cached request', async () => {
    const { findByText } = render(
      <SalaryCalculatorTestWrapper
        salaryRequestMock={{ effectiveDate: '2026-12-01' }}
        payrollDates={[
          { startDate: '2026-11-16', regularProcessDate: '2026-11-25' },
          { startDate: '2026-12-01', regularProcessDate: '2026-12-10' },
        ]}
      >
        <MhaEndWarning people={[jane]} effectiveDate="2026-11-16" />
      </SalaryCalculatorTestWrapper>,
    );

    expect(
      await findByText(
        "Jane Doe won't get MHA starting with the paycheck on 11/25/2026. This request sets their MHA to $0.",
      ),
    ).toBeInTheDocument();
  });

  it("falls back to the request's effective date when the server sends none", async () => {
    const { findByText } = render(
      <SalaryCalculatorTestWrapper
        salaryRequestMock={{ effectiveDate: '2026-11-16' }}
        payrollDates={[
          { startDate: '2026-11-16', regularProcessDate: '2026-11-25' },
        ]}
      >
        <MhaEndWarning people={[jane]} effectiveDate={null} />
      </SalaryCalculatorTestWrapper>,
    );

    expect(
      await findByText(
        "Jane Doe won't get MHA starting with the paycheck on 11/25/2026. This request sets their MHA to $0.",
      ),
    ).toBeInTheDocument();
  });

  it('leaves out the paycheck date when it is not a known payroll date', async () => {
    // The warning shows the same text while the payroll dates load, so wait for them
    const PayrollDatesLoaded: React.FC = () =>
      useEffectiveDateOptions() ? <p>Payroll dates loaded</p> : null;
    const { findByText, getByText } = render(
      <SalaryCalculatorTestWrapper
        salaryRequestMock={{ effectiveDate: '2026-11-16' }}
        payrollDates={[
          { startDate: '2026-12-01', regularProcessDate: '2026-12-10' },
        ]}
      >
        <PayrollDatesLoaded />
        <MhaEndWarning people={[jane]} effectiveDate="2026-11-16" />
      </SalaryCalculatorTestWrapper>,
    );

    await findByText('Payroll dates loaded');
    expect(
      getByText(
        "Jane Doe won't get MHA once this request takes effect. This request sets their MHA to $0.",
      ),
    ).toBeInTheDocument();
  });

  it('still lists a person whose reason it does not know', async () => {
    const { findByRole } = render(
      <SalaryCalculatorTestWrapper>
        <MhaEndWarning
          people={[{ ...jane, reason: 'SOME_NEW_REASON' }]}
          effectiveDate={null}
        />
      </SalaryCalculatorTestWrapper>,
    );

    expect(await findByRole('listitem')).toHaveTextContent(
      /^Jane Doe won't get MHA once this request takes effect\.$/,
    );
  });

  describe('when translated', () => {
    afterEach(() => {
      i18n.removeResourceBundle('en', 'translation');
    });

    it('lets each line be translated as one sentence', async () => {
      i18n.addResource(
        'en',
        'translation',
        "{{name}} won't get MHA starting with the paycheck on {{date}}. This request sets their MHA to $0.",
        'This request sets MHA to $0, so from {{date}} {{name}} gets none.',
      );
      const { findByText } = render(
        <SalaryCalculatorTestWrapper
          salaryRequestMock={{ effectiveDate: '2026-11-16' }}
          payrollDates={[
            { startDate: '2026-11-16', regularProcessDate: '2026-11-25' },
          ]}
        >
          <MhaEndWarning people={[jane]} effectiveDate="2026-11-16" />
        </SalaryCalculatorTestWrapper>,
      );

      expect(
        await findByText(
          'This request sets MHA to $0, so from 11/25/2026 Jane Doe gets none.',
        ),
      ).toBeInTheDocument();
    });
  });

  it('renders nothing when no people could be read', () => {
    const { queryByRole } = render(
      <SalaryCalculatorTestWrapper>
        <MhaEndWarning people={[]} effectiveDate={null} />
      </SalaryCalculatorTestWrapper>,
    );

    expect(queryByRole('list')).not.toBeInTheDocument();
  });
});
