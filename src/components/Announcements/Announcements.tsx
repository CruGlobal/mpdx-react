import { useRouter } from 'next/router';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { getApolloContext } from '@apollo/client';
import { DateTime } from 'luxon';
import { DisplayMethodEnum } from 'pages/api/graphql-rest.page.generated';
import { AlertBanner } from 'src/components/Shared/alertBanner/AlertBanner';
import {
  ActionEnum,
  ContactFilterStatusEnum,
} from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useContactPartnershipStatuses } from 'src/hooks/useContactPartnershipStatuses';
import { dispatch } from 'src/lib/analytics';
import i18n from 'src/lib/i18n';
import { DynamicAddAppealModal } from '../Tool/Appeal/Modals/AddAppealModal/DynamicAddAppealModal';
import { DynamicAnnouncementBanner } from './AnnouncementBanner/DynamicAnnouncementBanner';
import { DynamicAnnouncementModal } from './AnnouncementModal/DynamicAnnouncementModal';
import {
  ActionFragment,
  useAcknowledgeAnnouncementMutation,
  useAnnouncementsQuery,
} from './Announcements.generated';

const appealName = `${DateTime.local().year} ${i18n.t('End of Year Ask')}`;

export const Announcements: React.FC = () => {
  // Use NoApolloBeacon on pages without an <ApolloProvider>
  const hasApolloClient = Boolean(useContext(getApolloContext()).client);

  return hasApolloClient ? (
    <Announcement />
  ) : process.env.ALERT_MESSAGE ? (
    <AlertBanner
      text={process.env.ALERT_MESSAGE}
      localStorageName="ALERT_MESSAGE"
    />
  ) : null;
};

const Announcement: React.FC = () => {
  const { push } = useRouter();
  const accountListId = useAccountListId();
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [hideAnnouncement, setHideAnnouncement] = useState(false);
  const { contactStatuses } = useContactPartnershipStatuses();

  const { data } = useAnnouncementsQuery();
  const [acknowledgeAnnouncement] = useAcknowledgeAnnouncementMutation();

  // TODO replace this with the ability to only limit announcements to one item.
  const announcement = useMemo(() => {
    if (data?.announcements) {
      return data.announcements[0];
    }
    return null;
  }, [data]);

  const handleAcknowledge = async (
    announcementId: string,
    actionId?: string,
  ) => {
    if (!announcementId) {
      return;
    }

    await acknowledgeAnnouncement({
      variables: { input: { announcementId, actionId } },
    });
  };

  const handlePerformAction = useCallback(
    (action?: ActionFragment) => {
      if (action) {
        switch (action.action) {
          case ActionEnum.Go:
            if (action.args) {
              // TODO - Migrate the data on production, to convert to "Go" args to be to the new MPDX URL format
              push(`/accountLists/${accountListId}/${action.args}`);
            }
            break;
          case ActionEnum.AppealCreate:
            setShowAppealModal(true);
            break;
          case ActionEnum.Track:
            const userRatingMatch = action.args?.match(
              /^aa-(user-rating)-(\d)$/,
            );
            if (userRatingMatch) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const [_adobeEventName, event, rating] = userRatingMatch;
              dispatch(event, { rating });
            } else {
              dispatch(action?.args ?? 'undefined event');
            }
        }
      }

      // No matter what the action is, acknowledge the announcement to prevent it from showing again
      handleAcknowledge(announcement?.id ?? '', action?.id);
      setHideAnnouncement(true);
    },
    [accountListId, announcement],
  );

  const appealStatuses = useMemo(
    () => [
      {
        name: contactStatuses[ContactFilterStatusEnum.Active].translated,
        value: ContactFilterStatusEnum.Active,
      },

      {
        name: contactStatuses[ContactFilterStatusEnum.Null].translated,
        value: ContactFilterStatusEnum.Null,
      },
    ],
    [contactStatuses],
  );

  if (hideAnnouncement || !announcement) {
    return null;
  }

  return (
    <>
      {announcement.displayMethod === DisplayMethodEnum.Banner && (
        <DynamicAnnouncementBanner
          announcement={announcement}
          handlePerformAction={handlePerformAction}
        />
      )}
      {announcement.displayMethod === DisplayMethodEnum.Modal && (
        <DynamicAnnouncementModal announcement={announcement} />
      )}
      {showAppealModal && (
        <DynamicAddAppealModal
          appealName={appealName}
          appealStatuses={appealStatuses}
          isEndOfYearAsk={true}
          handleClose={() => setShowAppealModal(false)}
        />
      )}
    </>
  );
};
