import { renderHook } from '@testing-library/react-hooks';
import {
  PhaseEnum,
  PledgeFrequencyEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
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

  describe('getLocalizedPhase', () => {
    it('should return correctly formatted phase', () => {
      const { result } = renderHook(() => useLocalizedConstants());
      expect(result.current.getLocalizedPhase(PhaseEnum.Appointment)).toEqual(
        'Appointment',
      );
    });

    it('should return empty string for invalid inputs', () => {
      const { result } = renderHook(() => useLocalizedConstants());
      expect(result.current.getLocalizedPhase('invalid')).toEqual('');
    });
  });

  describe('getLocalizedPledgeFrequency', () => {
    it('should return correctly formatted phase', () => {
      const { result } = renderHook(() => useLocalizedConstants());
      expect(
        result.current.getLocalizedPledgeFrequency(
          PledgeFrequencyEnum.Every_2Weeks,
        ),
      ).toEqual('Every 2 Weeks');
    });

    it('should return empty string for invalid inputs', () => {
      const { result } = renderHook(() => useLocalizedConstants());
      expect(result.current.getLocalizedPledgeFrequency('invalid')).toEqual('');
    });
  });
});
