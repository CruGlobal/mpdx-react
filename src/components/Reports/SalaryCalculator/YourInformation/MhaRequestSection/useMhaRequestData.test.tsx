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

  it('validates required fields and max amounts', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: SalaryCalculatorTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.approvedAmount).toBe('$20,000');
    });

    const { schema } = result.current;

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

  it('shows ineligible message when user is not eligible', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: createWrapper({
        hcmUser: { mhaEit: { mhaEligibility: false } },
      }),
    });

    await waitFor(() => {
      expect(result.current.userPreferredName).toBe('John');
    });

    expect(result.current.showIneligibleMessage).toBe(true);
    expect(result.current.isIneligiblePlural).toBe(false);
    expect(result.current.ineligibleNames).toBe('John');
    expect(result.current.showUserFields).toBe(false);
    expect(result.current.showSpouseFields).toBe(true);
  });

  it('shows ineligible message when spouse is not eligible', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: createWrapper({
        hcmSpouse: { mhaEit: { mhaEligibility: false } },
      }),
    });

    await waitFor(() => {
      expect(result.current.userPreferredName).toBe('John');
    });

    expect(result.current.showIneligibleMessage).toBe(true);
    expect(result.current.isIneligiblePlural).toBe(false);
    expect(result.current.ineligibleNames).toBe('Jane');
    expect(result.current.showUserFields).toBe(true);
    expect(result.current.showSpouseFields).toBe(false);
  });

  it('shows ineligible message for both when neither is eligible', async () => {
    const { result } = renderHook(() => useMhaRequestData(), {
      wrapper: createWrapper({
        hcmUser: { mhaEit: { mhaEligibility: false } },
        hcmSpouse: { mhaEit: { mhaEligibility: false } },
      }),
    });

    await waitFor(() => {
      expect(result.current.userPreferredName).toBe('John');
    });

    expect(result.current.showIneligibleMessage).toBe(true);
    expect(result.current.isIneligiblePlural).toBe(true);
    expect(result.current.ineligibleNames).toBe('John and Jane');
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
      expect(result.current.showNoMhaMessage).toBe(true);
    });

    expect(result.current.isNoMhaPlural).toBe(false);
    expect(result.current.noMhaNames).toBe('John');
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
      expect(result.current.showNoMhaMessage).toBe(true);
    });

    expect(result.current.isNoMhaPlural).toBe(true);
    expect(result.current.noMhaNames).toBe('John and Jane');
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
});
