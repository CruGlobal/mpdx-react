import { renderHook } from '@testing-library/react-hooks';
import { StatusEnum } from 'src/graphql/types.generated';
import { useLocalizedConstants } from './useLocalizedConstants';

describe('useLocalizedConstants', () => {
  describe('getLocalizedContactStatus', () => {
    it('should return correctly formatted contact statuses', () => {
      const { result } = renderHook(() => useLocalizedConstants());
      expect(
        result.current.getLocalizedContactStatus(
          StatusEnum.ContactForAppointment,
        ),
      ).toEqual('Initiate for Appointment');
    });
    it('should return empty string for invalid statuses', () => {
      const { result } = renderHook(() => useLocalizedConstants());
      expect(result.current.getLocalizedContactStatus('invalid')).toEqual('');
    });
  });
});
