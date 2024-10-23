import React, { useContext, useMemo } from 'react';
import { getApolloContext } from '@apollo/client';
import { DisplayMethodEnum } from 'pages/api/graphql-rest.page.generated';
import { AlertBanner } from 'src/components/Shared/alertBanner/AlertBanner';
import { DynamicAnnouncementBanner } from './AnnouncementBanner/DynamicAnnouncementBanner';
import { DynamicAnnouncementModal } from './AnnouncementModal/DynamicAnnouncementBanner';
import { useAnnouncementsQuery } from './Announcements.generated';

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
  const { data } = useAnnouncementsQuery();

  const announcement = useMemo(() => {
    if (data?.announcements) {
      return data.announcements[0];
    }
    return null;
  }, [data]);

  if (!announcement) {
    return null;
  }

  return announcement.displayMethod === DisplayMethodEnum.Banner ? (
    <DynamicAnnouncementBanner announcement={announcement} />
  ) : (
    <DynamicAnnouncementModal announcement={announcement} />
  );
};
