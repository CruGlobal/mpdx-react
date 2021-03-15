import { MockedResponse } from '@apollo/client/testing';
import {
  AcknowledgeUserNotificationDocument,
  AcknowledgeUserNotificationMutation,
} from './AcknowledgeUserNotification.generated';

const acknowledgeUserNotificationMutationMock = (
  id: string,
): MockedResponse => {
  const data: AcknowledgeUserNotificationMutation = {
    acknowledgeUserNotification: {
      notification: {
        id,
        read: true,
      },
    },
  };

  return {
    request: {
      query: AcknowledgeUserNotificationDocument,
      variables: {
        notificationId: id,
      },
    },
    result: {
      data,
    },
  };
};

export default acknowledgeUserNotificationMutationMock;
