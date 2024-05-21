import { TFunction } from 'i18next';
import { v4 as uuidv4 } from 'uuid';
import { PhaseEnum } from 'src/graphql/types.generated';
import { ContactPartnershipStatus } from 'src/hooks/useContactPartnershipStatuses';
import {
  getContactStatusesByPhase,
  getLocalizedPhase,
} from 'src/utils/functions/getLocalizedPhase';
import { ContactFlowOption } from './ContactFlow';

export const getDefaultFlowOptions = (
  t: TFunction,
  contactPartnershipStatus: ContactPartnershipStatus,
): ContactFlowOption[] => {
  return [
    {
      id: uuidv4(),
      name: getLocalizedPhase(t, PhaseEnum.Connection),
      statuses: getContactStatusesByPhase(
        PhaseEnum.Connection,
        contactPartnershipStatus,
      ).map((status) => status.translated),
      color: 'color-warning',
    },
    {
      id: uuidv4(),
      name: getLocalizedPhase(t, PhaseEnum.Initiation),
      statuses: getContactStatusesByPhase(
        PhaseEnum.Initiation,
        contactPartnershipStatus,
      ).map((status) => status.translated),
      color: 'color-info',
    },
    {
      id: uuidv4(),
      name: getLocalizedPhase(t, PhaseEnum.Appointment),
      statuses: getContactStatusesByPhase(
        PhaseEnum.Appointment,
        contactPartnershipStatus,
      ).map((status) => status.translated),
      color: 'color-success',
    },
    {
      id: uuidv4(),
      name: getLocalizedPhase(t, PhaseEnum.FollowUp),
      statuses: getContactStatusesByPhase(
        PhaseEnum.FollowUp,
        contactPartnershipStatus,
      ).map((status) => status.translated),
      color: 'color-warning',
    },
    {
      id: uuidv4(),
      name: getLocalizedPhase(t, PhaseEnum.PartnerCare),
      statuses: getContactStatusesByPhase(
        PhaseEnum.PartnerCare,
        contactPartnershipStatus,
      ).map((status) => status.translated),
      color: 'color-success',
    },
    {
      id: uuidv4(),
      name: getLocalizedPhase(t, PhaseEnum.Archive),
      statuses: getContactStatusesByPhase(
        PhaseEnum.Archive,
        contactPartnershipStatus,
      ).map((status) => status.translated),
      color: 'color-text',
    },
  ];
};
