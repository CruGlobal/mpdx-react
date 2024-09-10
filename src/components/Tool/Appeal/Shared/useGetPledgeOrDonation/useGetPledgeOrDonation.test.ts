import { renderHook } from '@testing-library/react-hooks';
import { AppealStatusEnum } from 'src/components/Tool/Appeal/AppealsContext/AppealsContext';
import { defaultContact } from 'src/components/Tool/Appeal/List/ContactRow/ContactRowMock';
import { useGetPledgeOrDonation } from './useGetPledgeOrDonation';

const appealId = 'appealId';
describe('useGetPledgeOrDonation', () => {
  it('returns the normal donation amount when in appeal status Asked', () => {
    const { result } = renderHook(() =>
      useGetPledgeOrDonation({
        appealStatus: AppealStatusEnum.Asked,
        contact: defaultContact,
        appealId: appealId,
      }),
    );

    expect(result.current.amountAndFrequency).toEqual({
      amount: 'CA$500',
      dateOrFrequency: 'Monthly',
    });

    expect(result.current.totalPledgedDonations).toBeNull();
    expect(result.current.pledgeValues).toBeUndefined();
  });

  it('returns the normal donation amount when in appeal status Excluded', () => {
    const { result } = renderHook(() =>
      useGetPledgeOrDonation({
        appealStatus: AppealStatusEnum.Excluded,
        contact: defaultContact,
        appealId: appealId,
      }),
    );

    expect(result.current.amountAndFrequency).toEqual({
      amount: 'CA$500',
      dateOrFrequency: 'Monthly',
    });

    expect(result.current.totalPledgedDonations).toBeNull();
    expect(result.current.pledgeValues).toBeUndefined();
  });

  it('returns the pledge when in appeal status Committed', () => {
    const { result } = renderHook(() =>
      useGetPledgeOrDonation({
        appealStatus: AppealStatusEnum.NotReceived,
        contact: defaultContact,
        appealId: appealId,
      }),
    );

    expect(result.current.amountAndFrequency).toEqual({
      amount: '$3,000',
      dateOrFrequency: '(Aug 8, 2024)',
    });

    expect(result.current.totalPledgedDonations).toBeNull();
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
      useGetPledgeOrDonation({
        appealStatus: AppealStatusEnum.ReceivedNotProcessed,
        contact: defaultContact,
        appealId: appealId,
      }),
    );

    expect(result.current.amountAndFrequency).toEqual({
      amount: '$3,000',
      dateOrFrequency: '(Aug 8, 2024)',
    });

    expect(result.current.totalPledgedDonations).toBeNull();
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
      useGetPledgeOrDonation({
        appealStatus: AppealStatusEnum.Processed,
        contact: defaultContact,
        appealId: appealId,
      }),
    );

    expect(result.current.amountAndFrequency).toEqual({
      amount: '$3,000',
      dateOrFrequency: '',
    });

    expect(result.current.totalPledgedDonations).toEqual(
      '($50) (Jun 25, 2019)',
    );
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
        useGetPledgeOrDonation({
          appealStatus: AppealStatusEnum.NotReceived,
          contact: contact,
          appealId: appealId,
        }),
      );
      expect(result.current.amountAndFrequency).toEqual({
        amount: '$3,000',
        dateOrFrequency: '(Aug 8, 2001)',
      });
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
              amount: {
                amount: 50,
                convertedAmount: 50,
                convertedCurrency: 'USD',
              },
            },
          ],
        },
      };
      const { result } = renderHook(() =>
        useGetPledgeOrDonation({
          appealStatus: AppealStatusEnum.Processed,
          contact: contact,
          appealId: appealId,
        }),
      );
      expect(result.current.totalPledgedDonations).toEqual(
        '($50) (Jun 25, 2001)',
      );
      expect(result.current.pledgeOverdue).toEqual(false);
    });
  });

  it('adds up the total of all donations given and shows the last donated date', () => {
    const contact = {
      ...defaultContact,
      donations: {
        nodes: [
          ...defaultContact.donations.nodes,
          {
            id: 'donation-4',
            appeal: {
              id: 'appealId',
            },
            donationDate: '2024-08-08',
            amount: {
              amount: 1000,
              convertedAmount: 1000,
              convertedCurrency: 'USD',
            },
          },
        ],
      },
    };
    const { result } = renderHook(() =>
      useGetPledgeOrDonation({
        appealStatus: AppealStatusEnum.Processed,
        contact: contact,
        appealId: appealId,
      }),
    );
    expect(result.current.totalPledgedDonations).toEqual(
      '($1,050) (Aug 8, 2024)',
    );
  });

  // This only happens when the donations are re-assigned to a new appeal after the pledge is processed
  // This is a bug, but not likely to be fixed in a near future.
  // Testing it to make sure it's working as expected
  it('should show $0 when pledge is processed but no donations have been given', () => {
    const contact = {
      ...defaultContact,
      donations: {
        nodes: [
          defaultContact.donations.nodes[0],
          defaultContact.donations.nodes[1],
        ],
      },
    };
    const { result } = renderHook(() =>
      useGetPledgeOrDonation({
        appealStatus: AppealStatusEnum.Processed,
        contact: contact,
        appealId: appealId,
      }),
    );
    expect(result.current.totalPledgedDonations).toEqual('($0) ');
  });
});
