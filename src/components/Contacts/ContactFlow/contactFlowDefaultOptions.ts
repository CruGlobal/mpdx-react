import { TFunction } from 'i18next';
import { v4 as uuidv4 } from 'uuid';
import { PhaseEnum, StatusEnum } from 'src/graphql/types.generated';
import { ContactStatuses } from 'src/hooks/useContactPartnershipStatuses';
import { getLocalizedContactStatus } from 'src/utils/functions/getLocalizedContactStatus';
import {
  getContactStatusesByPhase,
  getLocalizedPhase,
} from 'src/utils/functions/getLocalizedPhase';
import { ContactFlowOption } from './ContactFlow';

export enum DefaultTypeEnum {
  Us = 'US',
  Global = 'GLOBAL',
}

export const getDefaultFlowOptions = (
  t: TFunction,
  contactStatuses: ContactStatuses,
  type: DefaultTypeEnum = DefaultTypeEnum.Us,
): ContactFlowOption[] => {
  switch (type) {
    case DefaultTypeEnum.Global:
      return [
        {
          id: uuidv4(),
          name: t('Contacts'),
          statuses: [
            getLocalizedContactStatus(t, StatusEnum.NeverContacted),
            getLocalizedContactStatus(t, StatusEnum.ResearchContactInfo),
          ],
          color: 'color-error',
        },
        {
          id: uuidv4(),
          name: t('Call Backs'),
          statuses: [
            getLocalizedContactStatus(t, StatusEnum.CallForDecision),
            getLocalizedContactStatus(t, StatusEnum.ContactForAppointment),
          ],
          color: 'color-info',
        },
        {
          id: uuidv4(),
          name: t('Appointments'),
          statuses: [
            getLocalizedContactStatus(t, StatusEnum.AppointmentScheduled),
          ],
          color: 'color-warning',
        },
        {
          id: uuidv4(),
          name: t('Future Contacts'),
          statuses: [
            getLocalizedContactStatus(t, StatusEnum.PartnerPray),
            getLocalizedContactStatus(t, StatusEnum.PartnerSpecial),
            getLocalizedContactStatus(t, StatusEnum.PartnerPray),
            getLocalizedContactStatus(t, StatusEnum.AskInFuture),
            getLocalizedContactStatus(t, StatusEnum.NotInterested),
          ],
          color: 'color-success',
        },
        {
          id: uuidv4(),
          name: t('Maintaining'),
          statuses: [
            getLocalizedContactStatus(t, StatusEnum.CultivateRelationship),
          ],
          color: 'color-text',
        },
      ];
    default:
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
  }
};
