import { ApolloError } from '@apollo/client';
import { render, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import {
  MhaEndPerson,
  MhaEndReasonEnum,
  MhaEndWarning,
  mhaEndPeopleFromError,
} from './MhaEndWarning';

const mutationSpy = jest.fn();

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

describe('mhaEndPeopleFromError', () => {
  it('returns null for an error that did not come from Apollo', () => {
    expect(mhaEndPeopleFromError(new Error('Network down'))).toBeNull();
  });

  it('returns null for an Apollo error with another code', () => {
    expect(
      mhaEndPeopleFromError(apolloError({ code: 'INTERNAL_SERVER_ERROR' })),
    ).toBeNull();
  });

  it('returns each person the request would end MHA for', () => {
    expect(
      mhaEndPeopleFromError(
        apolloError({
          code: 'MHA_WOULD_END',
          effectiveDate: '2026-11-16',
          people: [
            { ...jane, currentTakenAmount: 12000 },
            { ...john, currentTakenAmount: 7200 },
          ],
        }),
      ),
    ).toEqual([jane, john]);
  });

  it('keeps the warning but skips people it cannot read', () => {
    expect(
      mhaEndPeopleFromError(
        apolloError({
          code: 'MHA_WOULD_END',
          people: [{ name: 'No Person Number' }, 'Jane Doe', jane],
        }),
      ),
    ).toEqual([jane]);
    expect(
      mhaEndPeopleFromError(apolloError({ code: 'MHA_WOULD_END' })),
    ).toEqual([]);
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
        <MhaEndWarning people={[jane, john]} />
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

  it('leaves out the paycheck date when it is not a known payroll date', async () => {
    const { getByText } = render(
      <SalaryCalculatorTestWrapper
        salaryRequestMock={{ effectiveDate: '2026-11-16' }}
        payrollDates={[
          { startDate: '2026-12-01', regularProcessDate: '2026-12-10' },
        ]}
        onCall={mutationSpy}
      >
        <MhaEndWarning people={[jane]} />
      </SalaryCalculatorTestWrapper>,
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('PayrollDates'),
    );
    expect(
      getByText(
        "Jane Doe won't get MHA once this request takes effect. This request sets their MHA to $0.",
      ),
    ).toBeInTheDocument();
  });

  it('still lists a person whose reason it does not know', async () => {
    const { findByRole } = render(
      <SalaryCalculatorTestWrapper>
        <MhaEndWarning people={[{ ...jane, reason: 'SOME_NEW_REASON' }]} />
      </SalaryCalculatorTestWrapper>,
    );

    expect(await findByRole('listitem')).toHaveTextContent(
      /^Jane Doe won't get MHA once this request takes effect\.$/,
    );
  });

  it('renders nothing when no people could be read', () => {
    const { queryByRole } = render(
      <SalaryCalculatorTestWrapper>
        <MhaEndWarning people={[]} />
      </SalaryCalculatorTestWrapper>,
    );

    expect(queryByRole('list')).not.toBeInTheDocument();
  });
});
