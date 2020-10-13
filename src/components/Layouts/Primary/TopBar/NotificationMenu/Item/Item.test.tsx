import React from 'react';
import { sub } from 'date-fns';
import MockDate from 'mockdate';
import userEvent from '@testing-library/user-event';
import { InMemoryCache } from '@apollo/client';
import TestWrapper from '../../../../../../../__tests__/util/TestWrapper';
import { NotificationTypeTypeEnum } from '../../../../../../../types/globalTypes';
import {
    GetNotificationsQuery,
    GetNotificationsQuery_userNotifications_edges_node as Notification,
} from '../../../../../../../types/GetNotificationsQuery';
import { render, waitFor } from '../../../../../../../__tests__/util/testingLibraryReactMock';
import GET_NOTIFICATIONS_QUERY from '../getNotificationsQuery.graphql';
import acknowledgeUserNotificationMutationMock from './Item.mock';
import NotificationMenuItem from '.';

describe('NotificationMenuItem', () => {
    const id = 'd1b7a8c1-9b2e-4234-b2d6-e52c151bbc7b';
    const itemWithoutDonation = (
        type: NotificationTypeTypeEnum,
        occurredAt = '2020-05-25T20:00:00-04:00',
    ): Notification => {
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
    const itemWithDonation = (type: NotificationTypeTypeEnum): Notification => {
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
                <NotificationMenuItem item={itemWithoutDonation(NotificationTypeTypeEnum.CALL_PARTNER_ONCE_PER_YEAR)} />
            </TestWrapper>,
        );
        expect(getByRole('button').textContent).toEqual('SSmith, RogerMay 26, 2020 — No call logged in the past year');
    });

    it('LARGER_GIFT', () => {
        const { getByRole } = render(
            <TestWrapper>
                <NotificationMenuItem item={itemWithoutDonation(NotificationTypeTypeEnum.LARGER_GIFT)} />
            </TestWrapper>,
        );
        expect(getByRole('button').textContent).toEqual(
            'SSmith, RogerMay 26, 2020 — Gave a larger gift than their commitment amount',
        );
    });

    it('LARGER_GIFT with donation', () => {
        const { getByRole } = render(
            <TestWrapper>
                <NotificationMenuItem item={itemWithDonation(NotificationTypeTypeEnum.LARGER_GIFT)} />
            </TestWrapper>,
        );
        expect(getByRole('button').textContent).toEqual(
            'SSmith, RogerMay 26, 2020 — Gave a gift of A$10,000 which is greater than their commitment amount',
        );
    });

    it('LONG_TIME_FRAME_GIFT', () => {
        const { getByRole } = render(
            <TestWrapper>
                <NotificationMenuItem item={itemWithoutDonation(NotificationTypeTypeEnum.LONG_TIME_FRAME_GIFT)} />
            </TestWrapper>,
        );
        expect(getByRole('button').textContent).toEqual(
            'SSmith, RogerMay 26, 2020 — Gave a gift where commitment frequency is set to semi-annual or greater',
        );
    });

    it('LONG_TIME_FRAME_GIFT with donation', () => {
        const { getByRole } = render(
            <TestWrapper>
                <NotificationMenuItem item={itemWithDonation(NotificationTypeTypeEnum.LONG_TIME_FRAME_GIFT)} />
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
                    item={itemWithoutDonation(NotificationTypeTypeEnum.MISSING_ADDRESS_IN_NEWSLETTER)}
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
                    item={itemWithoutDonation(NotificationTypeTypeEnum.MISSING_EMAIL_IN_NEWSLETTER)}
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
                    item={itemWithoutDonation(NotificationTypeTypeEnum.NEW_DESIGNATION_ACCOUNT_SUBSCRIPTION)}
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
                    item={itemWithoutDonation(NotificationTypeTypeEnum.NEW_PARTNER_DUPLICATE_MERGED)}
                />
            </TestWrapper>,
        );
        expect(getByRole('button').textContent).toEqual('SSmith, RogerMay 26, 2020 — Added and merged');
    });

    it('NEW_PARTNER_DUPLICATE_NOT_MERGED', () => {
        const { getByRole } = render(
            <TestWrapper>
                <NotificationMenuItem
                    item={itemWithoutDonation(NotificationTypeTypeEnum.NEW_PARTNER_DUPLICATE_NOT_MERGED)}
                />
            </TestWrapper>,
        );
        expect(getByRole('button').textContent).toEqual('SSmith, RogerMay 26, 2020 — Added but not merged');
    });

    it('NEW_PARTNER_NO_DUPLICATE', () => {
        const { getByRole } = render(
            <TestWrapper>
                <NotificationMenuItem item={itemWithoutDonation(NotificationTypeTypeEnum.NEW_PARTNER_NO_DUPLICATE)} />
            </TestWrapper>,
        );
        expect(getByRole('button').textContent).toEqual('SSmith, RogerMay 26, 2020 — Added with no duplicate found');
    });

    it('RECONTINUING_GIFT', () => {
        const { getByRole } = render(
            <TestWrapper>
                <NotificationMenuItem item={itemWithoutDonation(NotificationTypeTypeEnum.RECONTINUING_GIFT)} />
            </TestWrapper>,
        );
        expect(getByRole('button').textContent).toEqual('SSmith, RogerMay 26, 2020 — Recontinued giving');
    });

    it('REMIND_PARTNER_IN_ADVANCE', () => {
        const { getByRole } = render(
            <TestWrapper>
                <NotificationMenuItem item={itemWithoutDonation(NotificationTypeTypeEnum.REMIND_PARTNER_IN_ADVANCE)} />
            </TestWrapper>,
        );
        expect(getByRole('button').textContent).toEqual(
            'SSmith, RogerMay 26, 2020 — Semi-annual or greater gift is expected one month from now',
        );
    });

    it('SMALLER_GIFT', () => {
        const { getByRole } = render(
            <TestWrapper>
                <NotificationMenuItem item={itemWithoutDonation(NotificationTypeTypeEnum.SMALLER_GIFT)} />
            </TestWrapper>,
        );
        expect(getByRole('button').textContent).toEqual(
            'SSmith, RogerMay 26, 2020 — Gave a smaller gift than their commitment amount',
        );
    });

    it('SMALLER_GIFT with donation', () => {
        const { getByRole } = render(
            <TestWrapper>
                <NotificationMenuItem item={itemWithDonation(NotificationTypeTypeEnum.SMALLER_GIFT)} />
            </TestWrapper>,
        );
        expect(getByRole('button').textContent).toEqual(
            'SSmith, RogerMay 26, 2020 — Gave a gift of A$10,000 which is less than their commitment amount',
        );
    });

    it('SPECIAL_GIFT', () => {
        const { getByRole } = render(
            <TestWrapper>
                <NotificationMenuItem item={itemWithoutDonation(NotificationTypeTypeEnum.SPECIAL_GIFT)} />
            </TestWrapper>,
        );
        expect(getByRole('button').textContent).toEqual('SSmith, RogerMay 26, 2020 — Gave a special gift');
    });

    it('SPECIAL_GIFT with donation', () => {
        const { getByRole } = render(
            <TestWrapper>
                <NotificationMenuItem item={itemWithDonation(NotificationTypeTypeEnum.SPECIAL_GIFT)} />
            </TestWrapper>,
        );
        expect(getByRole('button').textContent).toEqual('SSmith, RogerMay 26, 2020 — Gave a special gift of A$10,000');
    });

    it('STARTED_GIVING', () => {
        const { getByRole } = render(
            <TestWrapper>
                <NotificationMenuItem item={itemWithoutDonation(NotificationTypeTypeEnum.STARTED_GIVING)} />
            </TestWrapper>,
        );
        expect(getByRole('button').textContent).toEqual('SSmith, RogerMay 26, 2020 — Started giving');
    });

    it('STOPPED_GIVING', () => {
        const { getByRole } = render(
            <TestWrapper>
                <NotificationMenuItem item={itemWithoutDonation(NotificationTypeTypeEnum.STOPPED_GIVING)} />
            </TestWrapper>,
        );
        expect(getByRole('button').textContent).toEqual('SSmith, RogerMay 26, 2020 — Missed a gift');
    });

    it('THANK_PARTNER_ONCE_PER_YEAR', () => {
        const { getByRole } = render(
            <TestWrapper>
                <NotificationMenuItem
                    item={itemWithoutDonation(NotificationTypeTypeEnum.THANK_PARTNER_ONCE_PER_YEAR)}
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
                <NotificationMenuItem item={itemWithoutDonation(NotificationTypeTypeEnum.UPCOMING_ANNIVERSARY)} />
            </TestWrapper>,
        );
        expect(getByRole('button').textContent).toEqual('SSmith, RogerMay 26, 2020 — Upcoming anniversary');
    });

    it('UPCOMING_BIRTHDAY', () => {
        const { getByRole } = render(
            <TestWrapper>
                <NotificationMenuItem item={itemWithoutDonation(NotificationTypeTypeEnum.UPCOMING_BIRTHDAY)} />
            </TestWrapper>,
        );
        expect(getByRole('button').textContent).toEqual('SSmith, RogerMay 26, 2020 — Upcoming birthday');
    });

    it('UNKNOWN_NOTIFICATION_TYPE', () => {
        const { getByRole } = render(
            <TestWrapper>
                <NotificationMenuItem
                    item={itemWithoutDonation(('UNKNOWN_NOTIFICATION_TYPE' as unknown) as NotificationTypeTypeEnum)}
                />
            </TestWrapper>,
        );
        expect(getByRole('button').textContent).toEqual('SSmith, RogerMay 26, 2020 — Custom notification description');
    });

    describe('MockDate', () => {
        beforeEach(() => {
            MockDate.set(new Date(2020, 1, 1));
        });

        afterEach(() => {
            MockDate.reset();
        });

        it('previousItem', () => {
            const { getByRole } = render(
                <TestWrapper>
                    <NotificationMenuItem
                        item={itemWithoutDonation(
                            NotificationTypeTypeEnum.CALL_PARTNER_ONCE_PER_YEAR,
                            new Date().toISOString(),
                        )}
                        previousItem={itemWithoutDonation(
                            NotificationTypeTypeEnum.CALL_PARTNER_ONCE_PER_YEAR,
                            sub(new Date(), { months: 2 }).toISOString(),
                        )}
                    />
                </TestWrapper>,
            );
            expect(getByRole('heading').textContent).toEqual('Feb 2020');
        });
    });

    describe('onClick', () => {
        it('calls function', async () => {
            const cache = new InMemoryCache({ addTypename: false });
            jest.spyOn(cache, 'writeQuery');
            const data: GetNotificationsQuery = {
                userNotifications: {
                    edges: [],
                    pageInfo: {
                        endCursor: null,
                        hasNextPage: false,
                    },
                    unreadCount: 2,
                },
            };
            cache.writeQuery({
                query: GET_NOTIFICATIONS_QUERY,
                variables: {
                    accountListId: '1',
                    after: null,
                },
                data,
            });
            const handleClick = jest.fn();
            const { getByRole } = render(
                <TestWrapper
                    mocks={[acknowledgeUserNotificationMutationMock(id)]}
                    initialState={{ accountListId: '1' }}
                    cache={cache}
                >
                    <NotificationMenuItem
                        item={itemWithoutDonation(NotificationTypeTypeEnum.CALL_PARTNER_ONCE_PER_YEAR)}
                        onClick={handleClick}
                    />
                </TestWrapper>,
            );
            userEvent.click(getByRole('button'));
            await waitFor(() => expect(handleClick).toHaveBeenCalled());
            expect(cache.writeQuery).toHaveBeenCalledWith({
                query: GET_NOTIFICATIONS_QUERY,
                variables: {
                    accountListId: '1',
                    after: null,
                },
                data: {
                    userNotifications: {
                        edges: [],
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
