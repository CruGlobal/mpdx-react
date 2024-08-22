import { NotificationTypeTypeEnum } from 'src/graphql/types.generated';

const createNotification = (type, id) => ({
  app: false,
  email: false,
  task: false,
  notificationType: {
    id,
    descriptionTemplate: type,
    type,
  },
});

const createNotificationType = (type, id) => ({
  id: id,
  type: type,
  descriptionTemplate: type,
});

export const notificationSettingsMocks = {
  NotificationsPreferences: {
    notificationPreferences: {
      nodes: [
        createNotification(
          NotificationTypeTypeEnum.CallPartnerOncePerYear,
          '111',
        ),
        createNotification(NotificationTypeTypeEnum.LargerGift, '222'),
        createNotification(NotificationTypeTypeEnum.LongTimeFrameGift, '333'),
      ],
    },
  },
  NotificationTypes: {
    notificationTypes: [
      createNotificationType(
        NotificationTypeTypeEnum.CallPartnerOncePerYear,
        '111',
      ),
      createNotificationType(NotificationTypeTypeEnum.LargerGift, '222'),
      createNotificationType(NotificationTypeTypeEnum.LongTimeFrameGift, '333'),
    ],
  },
};
