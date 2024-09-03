import { renderHook } from '@testing-library/react-hooks';
import { useGetExcludedReasons } from './useGetExcludedReasons';
import {
  contactId,
  defaultExcludedContacts,
} from './useGetExcludedReasonsMock';

describe('useGetExcludedReasons', () => {
  it('should return empty string', () => {
    const { result } = renderHook(() =>
      useGetExcludedReasons({
        excludedContacts: defaultExcludedContacts,
        contactId: '',
      }),
    );

    expect(result.current.length).toEqual(0);

    const { result: resultOne } = renderHook(() =>
      useGetExcludedReasons({
        excludedContacts: defaultExcludedContacts,
        contactId: '',
      }),
    );

    expect(resultOne.current.length).toEqual(0);

    const { result: resultTwo } = renderHook(() =>
      useGetExcludedReasons({
        excludedContacts: defaultExcludedContacts,
        contactId: 'contactID3',
      }),
    );

    expect(resultTwo.current.length).toEqual(0);
  });

  it('should return the correct reason', () => {
    const { result } = renderHook(() =>
      useGetExcludedReasons({
        excludedContacts: defaultExcludedContacts,
        contactId,
      }),
    );

    expect(result.current.length).toEqual(1);
    expect(result.current[0]).toEqual('Send Appeals?" set to No');
  });

  it('should return both the correct reasons', () => {
    const { result } = renderHook(() =>
      useGetExcludedReasons({
        excludedContacts: defaultExcludedContacts,
        contactId: 'contactID2',
      }),
    );

    expect(result.current.length).toEqual(2);
    expect(result.current[0]).toEqual(
      'May have given a special gift in the last 3 months',
    );
    expect(result.current[1]).toEqual('Stopped Giving Range');
  });
});
