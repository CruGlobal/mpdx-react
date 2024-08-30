import { renderHook } from '@testing-library/react-hooks';
import { ExcludedAppealContactReasonEnum } from 'src/graphql/types.generated';
import { useGetExcludedReasons } from './useGetExcludedReasons';

const contactID = 'contactID';
const defaultExcludedContacts = [
  {
    id: 'id1',
    contact: {
      id: 'contactID',
    },
    reasons: [ExcludedAppealContactReasonEnum.NoAppeals],
  },
  {
    id: 'id2',
    contact: {
      id: 'contactID2',
    },
    reasons: [
      ExcludedAppealContactReasonEnum.GaveMoreThanPledgedRange,
      ExcludedAppealContactReasonEnum.StoppedGivingRange,
    ],
  },
];

describe('useGetExcludedReasons', () => {
  it('should return empty string', () => {
    const { result } = renderHook(() =>
      useGetExcludedReasons(defaultExcludedContacts, ''),
    );

    expect(result.current.length).toEqual(0);

    const { result: resultOne } = renderHook(() =>
      useGetExcludedReasons(defaultExcludedContacts, ''),
    );

    expect(resultOne.current.length).toEqual(0);

    const { result: resultTwo } = renderHook(() =>
      useGetExcludedReasons(defaultExcludedContacts, 'contactID3'),
    );

    expect(resultTwo.current.length).toEqual(0);
  });

  it('should return the correct reason', () => {
    const { result } = renderHook(() =>
      useGetExcludedReasons(defaultExcludedContacts, contactID),
    );

    expect(result.current.length).toEqual(1);
    expect(result.current[0]).toEqual('Send Appeals?" set to No');
  });

  it('should return both the correct reasons', () => {
    const { result } = renderHook(() =>
      useGetExcludedReasons(defaultExcludedContacts, 'contactID2'),
    );

    expect(result.current.length).toEqual(2);
    expect(result.current[0]).toEqual(
      'May have given a special gift in the last 3 months',
    );
    expect(result.current[1]).toEqual('Stopped Giving Range');
  });
});
