import {
  ActionEnum,
  ActionStyleEnum,
  DisplayMethodEnum,
} from 'src/graphql/types.generated';
import { AnnouncementFragment } from './Announcements.generated';

export const announcement: AnnouncementFragment = {
  id: 'announcement-1',
  displayMethod: DisplayMethodEnum.Banner,
  title: 'Announcement Title',
  body: 'Announcement Body',
  imageUrl: 'https://example.com/image.png',
  actions: [
    {
      id: 'action-1',
      style: ActionStyleEnum.Primary,
      label: 'Contacts',
      args: 'contacts',
      action: ActionEnum.Go,
    },
    {
      id: 'action-2',
      style: ActionStyleEnum.Warning,
      label: 'Create Appeal',
      args: 'appeal-args',
      action: ActionEnum.AppealCreate,
    },
    {
      id: 'action-3',
      style: ActionStyleEnum.Warning,
      label: 'Track',
      args: 'track-args',
      action: ActionEnum.Track,
    },
  ],
};
