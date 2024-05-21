import { TFunction } from 'i18next';
import { v4 as uuidv4 } from 'uuid';
import { PhaseEnum } from 'src/graphql/types.generated';
import { ContactStatuses } from 'src/hooks/useContactPartnershipStatuses';
import {
  getContactStatusesByPhase,
  getLocalizedPhase,
} from 'src/utils/functions/getLocalizedPhase';
import { ContactFlowOption } from './ContactFlow';

export const getDefaultFlowOptions = (
  t: TFunction,
  contactStatuses: ContactStatuses,
): ContactFlowOption[] => {
  return [
    {
      id: uuidv4(),
      name: getLocalizedPhase(t, PhaseEnum.Connection),
      statuses: getContactStatusesByPhase(
        PhaseEnum.Connection,
        contactStatuses,
      ).map((status) => status.translated),
      color: 'color-warning',
    },
    {
      id: uuidv4(),
      name: getLocalizedPhase(t, PhaseEnum.Initiation),
      statuses: getContactStatusesByPhase(
        PhaseEnum.Initiation,
        contactStatuses,
      ).map((status) => status.translated),
      color: 'color-info',
    },
    {
      id: uuidv4(),
      name: getLocalizedPhase(t, PhaseEnum.Appointment),
      statuses: getContactStatusesByPhase(
        PhaseEnum.Appointment,
        contactStatuses,
      ).map((status) => status.translated),
      color: 'color-success',
    },
    {
      id: uuidv4(),
      name: getLocalizedPhase(t, PhaseEnum.FollowUp),
      statuses: getContactStatusesByPhase(
        PhaseEnum.FollowUp,
        contactStatuses,
      ).map((status) => status.translated),
      color: 'color-warning',
    },
    {
      id: uuidv4(),
      name: getLocalizedPhase(t, PhaseEnum.PartnerCare),
      statuses: getContactStatusesByPhase(
        PhaseEnum.PartnerCare,
        contactStatuses,
      ).map((status) => status.translated),
      color: 'color-success',
    },
    {
      id: uuidv4(),
      name: getLocalizedPhase(t, PhaseEnum.Archive),
      statuses: getContactStatusesByPhase(
        PhaseEnum.Archive,
        contactStatuses,
      ).map((status) => status.translated),
      color: 'color-text',
    },
  ];
};
