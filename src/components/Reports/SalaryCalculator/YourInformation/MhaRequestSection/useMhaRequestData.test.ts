import { renderHook, waitFor } from '@testing-library/react';
import { SalaryCalculatorTestWrapper } from '../../SalaryCalculatorTestWrapper';
import { useMhaRequestData } from './useMhaRequestData';

describe('useMhaRequestData', () => {
  it('should return correct data and formatting', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: SalaryCalculatorTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.hasSpouse).toBe(true);
    });

    expect(result.current.approvedAmount).toBe('$20,000');
    expect(result.current.currentTakenAmount).toBe('$7,200');
    expect(result.current.currentSpouseTakenAmount).toBe('$12,000');
  });

  it('should validate required fields and max amounts', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: SalaryCalculatorTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.approvedAmount).toBe('$20,000');
    });

    const schema = result.current.schema;

    await expect(
      schema.validate({ mhaAmount: 25000, spouseMhaAmount: 5000 }),
    ).rejects.toThrow(
      'New Requested MHA cannot exceed Board Approved MHA Amount of $20,000',
    );

    await expect(
      schema.validate({ mhaAmount: 5000, spouseMhaAmount: 25000 }),
    ).rejects.toThrow(
      'New Requested MHA cannot exceed Board Approved MHA Amount of $20,000',
    );

    await expect(
      schema.validate({ mhaAmount: 8000, spouseMhaAmount: 10000 }),
    ).resolves.toEqual({ mhaAmount: 8000, spouseMhaAmount: 10000 });
  });
});
