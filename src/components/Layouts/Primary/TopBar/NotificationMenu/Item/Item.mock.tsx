import { MockedResponse } from '@apollo/client/testing';
import { AcknowledgeUserNotificationMutation } from '../../../../../../../types/AcknowledgeUserNotificationMutation';
import { ACKNOWLEDGE_USER_NOTIFICATION_MUTATION } from './Item';

const acknowledgeUserNotificationMutationMock = (id: string): MockedResponse => {
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
            query: ACKNOWLEDGE_USER_NOTIFICATION_MUTATION,
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
