import React from 'react';
import { DateTime } from 'luxon';
import userEvent from '@testing-library/user-event';
import { InMemoryCache } from '@apollo/client';
import TestWrapper from '../../../../../../../../__tests__/util/TestWrapper';
import {
  render,
  waitFor,
} from '../../../../../../../../__tests__/util/testingLibraryReactMock';
import { NotificationTypeTypeEnum } from '../../../../../../../../graphql/types.generated';
import {
  GetNotificationsDocument,
  GetNotificationsQuery,
} from '../GetNotificationsQuery.generated';
import acknowledgeUserNotificationMutationMock from './Item.mock';
import NotificationMenuItem from '.';

jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId: 'abc' },
      isReady: true,
    };
  },
}));

describe.skip('NotificationMenuItem', () => {
  const id = 'd1b7a8c1-9b2e-4234-b2d6-e52c151bbc7b';
  const itemWithoutDonation = (
    type: NotificationTypeTypeEnum,
    occurredAt = '2020-05-25T20:00:00-04:00',
  ): GetNotificationsQuery['userNotifications']['nodes'][0] => {
    return {
      id,
      read: false,
      notification: {
        occurredAt,
        contact: {
          id: '942ea954-c251-44d6-8166-7a1879ecdbc7',
          name: 'Smith, Roger',
        },
        donation: null,
        notificationType: {
          id: '6eb32493-c51b-490a-955d-595642160a95',
          type,
          descriptionTemplate: 'Custom notification description',
        },
      },
    };
  };
  const itemWithDonation = (
    type: NotificationTypeTypeEnum,
  ): GetNotificationsQuery['userNotifications']['nodes'][0] => {
    return {
      id,
      read: false,
      notification: {
        occurredAt: '2020-05-25T20:00:00-04:00',
        contact: {
          id: '942ea954-c251-44d6-8166-7a1879ecdbc7',
          name: 'Smith, Roger',
        },
        donation: {
          id: '942ea954-c251-44d6-8166-7a1879ecdbc4',
          amount: {
            amount: 10000,
            currency: 'AUD',
            conversionDate: '2020-10-05',
          },
        },
        notificationType: {
          id: '6eb32493-c51b-490a-955d-595642160a95',
          type,
          descriptionTemplate: 'Custom notification description',
        },
      },
    };
  };

  it('default', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem />
      </TestWrapper>,
    );
    expect(getByRole('listitem')).toBeInTheDocument();
    expect(getByRole('separator')).toBeInTheDocument();
  });

  it('last', () => {
    const { queryByRole } = render(
      <TestWrapper>
        <NotificationMenuItem last />
      </TestWrapper>,
    );
    expect(queryByRole('separator')).not.toBeInTheDocument();
  });

  it('CALL_PARTNER_ONCE_PER_YEAR', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.CallPartnerOncePerYear,
          )}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — No call logged in the past year',
    );
  });

  it('LARGER_GIFT', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.LargerGift)}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — Gave a larger gift than their commitment amount',
    );
  });

  it('LARGER_GIFT with donation', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithDonation(NotificationTypeTypeEnum.LargerGift)}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — Gave a gift of A$10,000 which is greater than their commitment amount',
    );
  });

  it('LONG_TIME_FRAME_GIFT', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.LongTimeFrameGift)}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — Gave a gift where commitment frequency is set to semi-annual or greater',
    );
  });

  it('LONG_TIME_FRAME_GIFT with donation', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithDonation(NotificationTypeTypeEnum.LongTimeFrameGift)}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — Gave a gift of A$10,000 where commitment frequency is set to semi-annual or greater',
    );
  });

  it('MISSING_ADDRESS_IN_NEWSLETTER', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.MissingAddressInNewsletter,
          )}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — On your physical newsletter list but has no mailing address',
    );
  });

  it('MISSING_EMAIL_IN_NEWSLETTER', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.MissingEmailInNewsletter,
          )}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — On your email newsletter list but has no people with a valid email address',
    );
  });

  it('NEW_DESIGNATION_ACCOUNT_SUBSCRIPTION', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.NewDesignationAccountSubscription,
          )}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — Added through your Give Site subscription form',
    );
  });

  it('NEW_PARTNER_DUPLICATE_MERGED', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.NewPartnerDuplicateMerged,
          )}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — Added and merged',
    );
  });

  it('NEW_PARTNER_DUPLICATE_NOT_MERGED', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.NewPartnerDuplicateNotMerged,
          )}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — Added but not merged',
    );
  });

  it('NEW_PARTNER_NO_DUPLICATE', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.NewPartnerNoDuplicate,
          )}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — Added with no duplicate found',
    );
  });

  it('RECONTINUING_GIFT', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.RecontinuingGift)}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — Recontinued giving',
    );
  });

  it('REMIND_PARTNER_IN_ADVANCE', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.RemindPartnerInAdvance,
          )}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — Semi-annual or greater gift is expected one month from now',
    );
  });

  it('SMALLER_GIFT', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.SmallerGift)}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — Gave a smaller gift than their commitment amount',
    );
  });

  it('SMALLER_GIFT with donation', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithDonation(NotificationTypeTypeEnum.SmallerGift)}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — Gave a gift of A$10,000 which is less than their commitment amount',
    );
  });

  it('SPECIAL_GIFT', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.SpecialGift)}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — Gave a special gift',
    );
  });

  it('SPECIAL_GIFT with donation', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithDonation(NotificationTypeTypeEnum.SpecialGift)}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — Gave a special gift of A$10,000',
    );
  });

  it('STARTED_GIVING', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.StartedGiving)}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — Started giving',
    );
  });

  it('STOPPED_GIVING', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.StoppedGiving)}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — Missed a gift',
    );
  });

  it('THANK_PARTNER_ONCE_PER_YEAR', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.ThankPartnerOncePerYear,
          )}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — No thank you note logged in the past year',
    );
  });

  it('UPCOMING_ANNIVERSARY', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithoutDonation(
            NotificationTypeTypeEnum.UpcomingAnniversary,
          )}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — Upcoming anniversary',
    );
  });

  it('UPCOMING_BIRTHDAY', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithoutDonation(NotificationTypeTypeEnum.UpcomingBirthday)}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — Upcoming birthday',
    );
  });

  it('UNKNOWN_NOTIFICATION_TYPE', () => {
    const { getByRole } = render(
      <TestWrapper>
        <NotificationMenuItem
          item={itemWithoutDonation(
            'UNKNOWN_NOTIFICATION_TYPE' as unknown as NotificationTypeTypeEnum,
          )}
        />
      </TestWrapper>,
    );
    expect(getByRole('button').textContent).toEqual(
      'SSmith, RogerMay 26, 2020 — Custom notification description',
    );
  });

  describe('MockDate', () => {
    it('previousItem', () => {
      const { getByRole } = render(
        <TestWrapper>
          <NotificationMenuItem
            item={itemWithoutDonation(
              NotificationTypeTypeEnum.CallPartnerOncePerYear,
              DateTime.local().toISO(),
            )}
            previousItem={itemWithoutDonation(
              NotificationTypeTypeEnum.CallPartnerOncePerYear,
              DateTime.local().minus({ months: 2 }).toISO(),
            )}
          />
        </TestWrapper>,
      );
      expect(getByRole('heading').textContent).toEqual('Jan 2020');
    });
  });

  describe('onClick', () => {
    it('calls function', async () => {
      const cache = new InMemoryCache({ addTypename: false });
      jest.spyOn(cache, 'writeQuery');
      const data: GetNotificationsQuery = {
        userNotifications: {
          nodes: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
          unreadCount: 2,
        },
      };
      cache.writeQuery({
        query: GetNotificationsDocument,
        variables: {
          accountListId: 'abc',
          after: null,
        },
        data,
      });
      const handleClick = jest.fn();
      const { getByRole } = render(
        <TestWrapper
          mocks={[acknowledgeUserNotificationMutationMock(id)]}
          cache={cache}
        >
          <NotificationMenuItem
            item={itemWithoutDonation(
              NotificationTypeTypeEnum.CallPartnerOncePerYear,
            )}
            onClick={handleClick}
          />
        </TestWrapper>,
      );
      userEvent.click(getByRole('button'));
      await waitFor(() => expect(handleClick).toHaveBeenCalled());
      expect(cache.writeQuery).toHaveBeenCalledWith({
        query: GetNotificationsDocument,
        variables: {
          accountListId: 'abc',
          after: null,
        },
        data: {
          userNotifications: {
            nodes: [],
            pageInfo: {
              endCursor: null,
              hasNextPage: false,
            },
            unreadCount: 1,
          },
        },
      });
    });
  });
});
