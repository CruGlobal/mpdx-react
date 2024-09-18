import { TFunction } from 'i18next';
import { OptionsObject } from 'notistack';
import { Maybe, PledgeStatusEnum } from 'src/graphql/types.generated';
import { AppealStatusEnum } from '../../AppealsContext/AppealsContext';

interface HandleReceivedSnackBarNotificationsProps {
  dbStatus: Maybe<PledgeStatusEnum> | undefined;
  selectedAppealStatus: AppealStatusEnum;
  t: TFunction;
  enqueueSnackbar: (message: string, options?: OptionsObject) => void;
}
const handleReceivedSnackBarNotifications = ({
  dbStatus,
  selectedAppealStatus,
  t,
  enqueueSnackbar,
}: HandleReceivedSnackBarNotificationsProps) => {
  let message = '';
  const snackbarOptions: OptionsObject = {
    variant: 'warning',
  };
  if (
    dbStatus === PledgeStatusEnum.NotReceived &&
    selectedAppealStatus === AppealStatusEnum.ReceivedNotProcessed
  ) {
    message = t(
      'Unable to move contact to the "Received" column as gift has not been received by Cru. Status set to "Committed".',
    );
  } else if (
    dbStatus === PledgeStatusEnum.Processed &&
    (selectedAppealStatus === AppealStatusEnum.ReceivedNotProcessed ||
      selectedAppealStatus === AppealStatusEnum.NotReceived)
  ) {
    message = t(
      'Unable to move contact here as this gift is already processed.',
    );
  } else if (
    dbStatus === PledgeStatusEnum.ReceivedNotProcessed &&
    selectedAppealStatus === AppealStatusEnum.NotReceived
  ) {
    message = t(
      'Unable to move contact to the "Committed" column as part of the pledge has been Received.',
    );
  }

  if (message) {
    enqueueSnackbar(message, snackbarOptions);
  }
};

export default handleReceivedSnackBarNotifications;
