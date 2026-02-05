import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { SalaryCalculatorTestWrapper } from '../../SalaryCalculatorTestWrapper';
import { useMhaRequestData } from './useMhaRequestData';

describe('useMhaRequestData', () => {
  it('should return correct data and formatting', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: SalaryCalculatorTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.approvedAmount).toBe('$20,000');
    });

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
      schema.validate({ mhaAmount: undefined, spouseMhaAmount: 5000 }),
    ).rejects.toThrow('MHA Amount is required');

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

  it('should return ineligibility properties when user and spouse are eligible', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: SalaryCalculatorTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.showUserFields).toBe(true);
    });

    // Both are eligible, so no ineligible message
    expect(result.current.showIneligibleMessage).toBe(false);
    expect(result.current.isIneligiblePlural).toBe(false);
    expect(result.current.ineligibleNames).toBe('');
  });

  it('should show MHA form when user is eligible and has MHA request', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: SalaryCalculatorTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.showUserFields).toBe(true);
    });

    expect(result.current.showSpouseFields).toBe(true);
  });

  it('should show user fields when user is eligible and has MHA', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: SalaryCalculatorTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.showUserFields).toBe(true);
    });

    expect(result.current.showNoMhaMessage).toBe(false);
  });

  it('should show spouse fields when spouse is eligible and has MHA', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: SalaryCalculatorTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.showSpouseFields).toBe(true);
    });

    expect(result.current.showNoMhaMessage).toBe(false);
  });

  it('should return user and spouse preferred names', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: SalaryCalculatorTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.userPreferredName).toBe('John');
    });

    expect(result.current.spousePreferredName).toBe('Jane');
  });

  it('should show user ineligible message when user is not eligible', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <SalaryCalculatorTestWrapper
        hcmMock={{
          mhaEit: { mhaEligibility: false },
        }}
      >
        {children}
      </SalaryCalculatorTestWrapper>
    );

    const { result } = renderHook(() => useMhaRequestData(), { wrapper });

    // Wait for data to load by checking userPreferredName is populated
    await waitFor(() => {
      expect(result.current.userPreferredName).toBe('John');
    });

    expect(result.current.showIneligibleMessage).toBe(true);
    expect(result.current.isIneligiblePlural).toBe(false);
    expect(result.current.ineligibleNames).toBe('John');
    expect(result.current.showUserFields).toBe(false);
    expect(result.current.showSpouseFields).toBe(true);
  });

  it('should show spouse ineligible message when spouse is not eligible', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <SalaryCalculatorTestWrapper
        hcmSpouse={{
          mhaEit: { mhaEligibility: false },
        }}
      >
        {children}
      </SalaryCalculatorTestWrapper>
    );

    const { result } = renderHook(() => useMhaRequestData(), { wrapper });

    // Wait for data to load by checking userPreferredName is populated
    await waitFor(() => {
      expect(result.current.userPreferredName).toBe('John');
    });

    expect(result.current.showIneligibleMessage).toBe(true);
    expect(result.current.isIneligiblePlural).toBe(false);
    expect(result.current.ineligibleNames).toBe('Jane');
    expect(result.current.showUserFields).toBe(true);
    expect(result.current.showSpouseFields).toBe(false);
  });

  it('should show both ineligible when both are not eligible', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <SalaryCalculatorTestWrapper
        hcmMock={{
          mhaEit: { mhaEligibility: false },
        }}
        hcmSpouse={{
          mhaEit: { mhaEligibility: false },
        }}
      >
        {children}
      </SalaryCalculatorTestWrapper>
    );

    const { result } = renderHook(() => useMhaRequestData(), { wrapper });

    // Wait for data to load by checking userPreferredName is populated
    await waitFor(() => {
      expect(result.current.userPreferredName).toBe('John');
    });

    expect(result.current.showIneligibleMessage).toBe(true);
    expect(result.current.isIneligiblePlural).toBe(true);
    expect(result.current.ineligibleNames).toBe('John and Jane');
    expect(result.current.showUserFields).toBe(false);
    expect(result.current.showSpouseFields).toBe(false);
  });

  it('should show no MHA message when user is eligible but has no MHA request', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <SalaryCalculatorTestWrapper
        hcmMock={{
          mhaRequest: { currentApprovedOverallAmount: 0 },
        }}
      >
        {children}
      </SalaryCalculatorTestWrapper>
    );

    const { result } = renderHook(() => useMhaRequestData(), { wrapper });

    await waitFor(() => {
      expect(result.current.showNoMhaMessage).toBe(true);
    });

    expect(result.current.isNoMhaPlural).toBe(false);
    expect(result.current.noMhaNames).toBe('John');
    expect(result.current.showUserFields).toBe(false);
    expect(result.current.showSpouseFields).toBe(true);
  });

  it('should show no MHA message for both when both have no MHA request', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <SalaryCalculatorTestWrapper
        hcmMock={{
          mhaRequest: { currentApprovedOverallAmount: 0 },
        }}
        hcmSpouse={{
          mhaRequest: { currentApprovedOverallAmount: 0 },
        }}
      >
        {children}
      </SalaryCalculatorTestWrapper>
    );

    const { result } = renderHook(() => useMhaRequestData(), { wrapper });

    await waitFor(() => {
      expect(result.current.showNoMhaMessage).toBe(true);
    });

    expect(result.current.isNoMhaPlural).toBe(true);
    expect(result.current.noMhaNames).toBe('John and Jane');
    expect(result.current.showUserFields).toBe(false);
    expect(result.current.showSpouseFields).toBe(false);
  });

  it('should not show spouse fields when there is no spouse', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <SalaryCalculatorTestWrapper hasSpouse={false}>
        {children}
      </SalaryCalculatorTestWrapper>
    );

    const { result } = renderHook(() => useMhaRequestData(), { wrapper });

    await waitFor(() => {
      expect(result.current.showUserFields).toBe(true);
    });

    expect(result.current.showSpouseFields).toBe(false);
    expect(result.current.spousePreferredName).toBe('');
  });
});
