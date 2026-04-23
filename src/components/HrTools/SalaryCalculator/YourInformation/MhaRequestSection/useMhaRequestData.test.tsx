import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../../SalaryCalculatorTestWrapper';
import { useMhaRequestData } from './useMhaRequestData';

const createWrapper = (
  props: SalaryCalculatorTestWrapperProps,
): React.FC<{ children: React.ReactNode }> => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <SalaryCalculatorTestWrapper {...props}>
      {children}
    </SalaryCalculatorTestWrapper>
  );
  return Wrapper;
};

describe('useMhaRequestData', () => {
  it('returns correct data when both user and spouse are eligible with MHA', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: SalaryCalculatorTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.approvedAmount).toBe('$20,000');
    });

    expect(result.current.currentTakenAmount).toBe('$7,200');
    expect(result.current.currentSpouseTakenAmount).toBe('$12,000');

    expect(result.current.showUserFields).toBe(true);
    expect(result.current.showSpouseFields).toBe(true);

    expect(result.current.userPreferredName).toBe('John');
    expect(result.current.spousePreferredName).toBe('Jane');
  });

  it('rejects when individual amount exceeds approved amount', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: createWrapper({
        salaryRequestMock: { mhaAmount: 25000 },
        hasSpouse: false,
      }),
    });

    await waitFor(() => {
      expect(result.current.approvedAmount).toBe('$20,000');
    });

    await expect(
      result.current.schema.validate({
        mhaAmount: 25000,
        spouseMhaAmount: 0,
      }),
    ).rejects.toThrow(
      'New Requested MHA cannot exceed Board Approved MHA Amount of $20,000',
    );
  });

  it('rejects when combined amounts exceed approved amount', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: createWrapper({
        salaryRequestMock: { mhaAmount: 12000, spouseMhaAmount: 12000 },
      }),
    });

    await waitFor(() => {
      expect(result.current.approvedAmount).toBe('$20,000');
    });

    await expect(
      result.current.schema.validate({
        mhaAmount: 12000,
        spouseMhaAmount: 12000,
      }),
    ).rejects.toThrow(
      'Combined MHA amounts cannot exceed Board Approved MHA Amount of $20,000',
    );
  });

  it('allows amounts within approved limits', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: createWrapper({
        salaryRequestMock: { mhaAmount: 8000, spouseMhaAmount: 10000 },
      }),
    });

    await waitFor(() => {
      expect(result.current.approvedAmount).toBe('$20,000');
    });

    await expect(
      result.current.schema.validate({
        mhaAmount: 8000,
        spouseMhaAmount: 10000,
      }),
    ).resolves.toEqual({ mhaAmount: 8000, spouseMhaAmount: 10000 });
  });

  it('allows full approved amount to one person', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: createWrapper({
        salaryRequestMock: { mhaAmount: 20000, spouseMhaAmount: 0 },
      }),
    });

    await waitFor(() => {
      expect(result.current.approvedAmount).toBe('$20,000');
    });

    await expect(
      result.current.schema.validate({
        mhaAmount: 20000,
        spouseMhaAmount: 0,
      }),
    ).resolves.toEqual({ mhaAmount: 20000, spouseMhaAmount: 0 });
  });

  it('hides user fields when user is not eligible', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: createWrapper({
        hcmUser: { mhaEit: { mhaEligibility: false } },
      }),
    });

    await waitFor(() => {
      expect(result.current.userPreferredName).toBe('John');
    });

    expect(result.current.showUserFields).toBe(false);
    expect(result.current.showSpouseFields).toBe(true);
  });

  it('hides spouse fields when spouse is not eligible', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: createWrapper({
        hcmSpouse: { mhaEit: { mhaEligibility: false } },
      }),
    });

    await waitFor(() => {
      expect(result.current.userPreferredName).toBe('John');
    });

    expect(result.current.showUserFields).toBe(true);
    expect(result.current.showSpouseFields).toBe(false);
  });

  it('hides both fields when neither is eligible', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: createWrapper({
        hcmUser: { mhaEit: { mhaEligibility: false } },
        hcmSpouse: { mhaEit: { mhaEligibility: false } },
      }),
    });

    await waitFor(() => {
      expect(result.current.userPreferredName).toBe('John');
    });

    expect(result.current.showUserFields).toBe(false);
    expect(result.current.showSpouseFields).toBe(false);
  });

  it('shows no MHA message when user has no MHA request', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: createWrapper({
        hcmUser: { mhaRequest: { currentApprovedOverallAmount: 0 } },
      }),
    });

    await waitFor(() => {
      expect(result.current.anyEligibleWithoutApprovedMha).toBe(true);
    });

    expect(result.current.showUserFields).toBe(false);
    expect(result.current.showSpouseFields).toBe(true);
  });

  it('shows no MHA message for both when neither has MHA request', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: createWrapper({
        hcmUser: { mhaRequest: { currentApprovedOverallAmount: 0 } },
        hcmSpouse: { mhaRequest: { currentApprovedOverallAmount: 0 } },
      }),
    });

    await waitFor(() => {
      expect(result.current.anyEligibleWithoutApprovedMha).toBe(true);
    });

    expect(result.current.showUserFields).toBe(false);
    expect(result.current.showSpouseFields).toBe(false);
  });

  it('hides spouse fields when there is no spouse', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: createWrapper({ hasSpouse: false }),
    });

    await waitFor(() => {
      expect(result.current.showUserFields).toBe(true);
    });

    expect(result.current.showSpouseFields).toBe(false);
    expect(result.current.spousePreferredName).toBe('');
  });

  it('hides user fields when user is ineligible and no spouse exists', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: createWrapper({
        hcmUser: { mhaEit: { mhaEligibility: false } },
        hasSpouse: false,
      }),
    });

    await waitFor(() => {
      expect(result.current.userPreferredName).toBe('John');
    });

    expect(result.current.showUserFields).toBe(false);
    expect(result.current.showSpouseFields).toBe(false);
  });
});
