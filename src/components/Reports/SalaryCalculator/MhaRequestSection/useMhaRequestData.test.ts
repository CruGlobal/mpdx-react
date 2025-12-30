import { renderHook, waitFor } from '@testing-library/react';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { useMhaRequestData } from './useMhaRequestData';

describe('useMhaRequestData', () => {
  it('should return correct data and formatting', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: SalaryCalculatorTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.hasSpouse).toBe(true);
    });

    expect(result.current.self?.staffInfo.firstName).toBe('John');
    expect(result.current.spouse?.staffInfo.firstName).toBe('Jane');
    expect(result.current.boardApprovedAmount).toBe('$22,000');
    expect(result.current.currentApprovedAmountForStaff).toBe('$12,000');
    expect(result.current.currentApprovedSpouseAmountForStaff).toBe('$19,200');
  });

  it('should validate required fields and max amounts', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: SalaryCalculatorTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.boardApprovedAmount).toBe('$22,000');
    });

    const schema = result.current.schema;

    await expect(
      schema.validate({ mhaAmount: undefined, spouseMhaAmount: 5000 }),
    ).rejects.toThrow('MHA Amount is required');

    await expect(
      schema.validate({ mhaAmount: 15000, spouseMhaAmount: 5000 }),
    ).rejects.toThrow(
      'New Requested MHA cannot exceed Board Approved MHA Amount of $10,000',
    );

    await expect(
      schema.validate({ mhaAmount: 5000, spouseMhaAmount: 15000 }),
    ).rejects.toThrow(
      'New Requested MHA cannot exceed Board Approved MHA Amount of $12,000',
    );

    await expect(
      schema.validate({ mhaAmount: 8000, spouseMhaAmount: 10000 }),
    ).resolves.toEqual({ mhaAmount: 8000, spouseMhaAmount: 10000 });
  });
});
