import {
  staffAccount,
  staffConferenceSavings,
  staffSavings,
} from '../../Helper/TransferIcons';
import { StatusEnum } from '../../mockData';

export const iconMap: Record<string, React.ReactElement> = {
  staffAccount,
  staffConferenceSavings,
  staffSavings,
};

const pendingAvatarColor = '#FFC107';
const pendingChipColor = '#FFF8E1';
const ongoingAvatarColor = '#2196F3';
const ongoingChipColor = '#E3F2FD';
const completeAvatarColor = '#4CAF50';
const completeChipColor = '#E8F5E9';
const endedAvatarColor = '#9E9E9E';
const endedChipColor = '#FAFAFA';
const failedAvatarColor = '#F44336';
const failedChipColor = '#FEEBEE';

export const chipStyle: Record<
  StatusEnum,
  { avatarColor: string; chipColor: string }
> = {
  [StatusEnum.Pending]: {
    avatarColor: pendingAvatarColor,
    chipColor: pendingChipColor,
  },
  [StatusEnum.Ongoing]: {
    avatarColor: ongoingAvatarColor,
    chipColor: ongoingChipColor,
  },
  [StatusEnum.Complete]: {
    avatarColor: completeAvatarColor,
    chipColor: completeChipColor,
  },
  [StatusEnum.Ended]: {
    avatarColor: endedAvatarColor,
    chipColor: endedChipColor,
  },
  [StatusEnum.Failed]: {
    avatarColor: failedAvatarColor,
    chipColor: failedChipColor,
  },
};
