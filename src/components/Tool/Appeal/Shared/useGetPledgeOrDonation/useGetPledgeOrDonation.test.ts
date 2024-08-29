import { renderHook } from '@testing-library/react-hooks';
import { AppealStatusEnum } from 'src/components/Tool/Appeal/AppealsContext/AppealsContext';
import { defaultContact } from 'src/components/Tool/Appeal/List/ContactRow/ContactRowMock';
import { useGetPledgeOrDonation } from './useGetPledgeOrDonation';

const appealId = 'appealId';
describe('useGetPledgeOrDonation', () => {
  it('returns the normal donation amount when in appeal status Asked', () => {
    const { result } = renderHook(() =>
      useGetPledgeOrDonation(AppealStatusEnum.Asked, defaultContact, appealId),
    );

    expect(result.current.amountAndFrequency).toEqual(['CA$500', 'Monthly']);

    expect(result.current.pledgeDonations).toBeNull();
    expect(result.current.pledgeValues).toBeUndefined();
  });

  it('returns the normal donation amount when in appeal status Excluded', () => {
    const { result } = renderHook(() =>
      useGetPledgeOrDonation(
        AppealStatusEnum.Excluded,
        defaultContact,
        appealId,
      ),
    );

    expect(result.current.amountAndFrequency).toEqual(['CA$500', 'Monthly']);

    expect(result.current.pledgeDonations).toBeNull();
    expect(result.current.pledgeValues).toBeUndefined();
  });

  it('returns the pledge when in appeal status Committed', () => {
    const { result } = renderHook(() =>
      useGetPledgeOrDonation(
        AppealStatusEnum.NotReceived,
        defaultContact,
        appealId,
      ),
    );

    expect(result.current.amountAndFrequency).toEqual([
      '$3,000',
      '(Aug 8, 2024)',
    ]);

    expect(result.current.pledgeDonations).toBeNull();
    expect(result.current.pledgeValues).toEqual({
      amount: 3000,
      amountCurrency: 'USD',
      appeal: { id: appealId },
      expectedDate: '2024-08-08',
      id: 'pledge-1',
    });
  });

  it('returns the pledge when in appeal status Received', () => {
    const { result } = renderHook(() =>
      useGetPledgeOrDonation(
        AppealStatusEnum.ReceivedNotProcessed,
        defaultContact,
        appealId,
      ),
    );

    expect(result.current.amountAndFrequency).toEqual([
      '$3,000',
      '(Aug 8, 2024)',
    ]);

    expect(result.current.pledgeDonations).toBeNull();
    expect(result.current.pledgeValues).toEqual({
      amount: 3000,
      amountCurrency: 'USD',
      appeal: { id: appealId },
      expectedDate: '2024-08-08',
      id: 'pledge-1',
    });
  });

  it('returns the donations to appeal when in appeal status Given', () => {
    const { result } = renderHook(() =>
      useGetPledgeOrDonation(
        AppealStatusEnum.Processed,
        defaultContact,
        appealId,
      ),
    );

    expect(result.current.amountAndFrequency).toEqual(['$3,000']);

    expect(result.current.pledgeDonations).toEqual(['($50) (Jun 25, 2019)']);
    expect(result.current.pledgeValues).toEqual({
      amount: 3000,
      amountCurrency: 'USD',
      appeal: { id: appealId },
      expectedDate: '2024-08-08',
      id: 'pledge-1',
    });
  });

  describe('pledgeOverdue', () => {
    it('returns an overdue date when appeal status Received', () => {
      const contact = {
        ...defaultContact,
        pledges: [
          {
            id: 'pledge-1',
            amount: 3000,
            amountCurrency: 'USD',
            appeal: {
              id: 'appealId',
            },
            expectedDate: '2001-08-08',
          },
        ],
      };
      const { result } = renderHook(() =>
        useGetPledgeOrDonation(AppealStatusEnum.NotReceived, contact, appealId),
      );
      expect(result.current.amountAndFrequency).toEqual([
        '$3,000',
        '(Aug 8, 2001)',
      ]);
      expect(result.current.pledgeOverdue).toEqual(true);
    });

    it('returns an overdue date when appeal status Given', () => {
      const contact = {
        ...defaultContact,
        donations: {
          nodes: [
            {
              id: 'donation-3',
              appeal: {
                id: 'appealId',
              },
              donationDate: '2001-06-25',
              appealAmount: {
                amount: 50,
                convertedAmount: 50,
                convertedCurrency: 'USD',
              },
            },
          ],
        },
      };
      const { result } = renderHook(() =>
        useGetPledgeOrDonation(AppealStatusEnum.Processed, contact, appealId),
      );
      expect(result.current.pledgeDonations).toEqual(['($50) (Jun 25, 2001)']);
      expect(result.current.pledgeOverdue).toEqual(false);
    });
  });
});
