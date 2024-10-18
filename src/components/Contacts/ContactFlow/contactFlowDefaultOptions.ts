import { TFunction } from 'i18next';
import { v4 as uuidv4 } from 'uuid';
import { PhaseEnum, StatusEnum } from 'src/graphql/types.generated';
import { getLocalizedPhase } from 'src/utils/functions/getLocalizedPhase';
import { ContactFlowOption } from './ContactFlow';

export enum DefaultTypeEnum {
  Us = 'US',
  Global = 'GLOBAL',
}

export const getDefaultFlowOptions = (
  t: TFunction,
  getContactStatusesByPhase: (phase: string | null) => StatusEnum[],
  type: DefaultTypeEnum = DefaultTypeEnum.Us,
): ContactFlowOption[] => {
  switch (type) {
    case DefaultTypeEnum.Global:
      return [
        {
          id: uuidv4(),
          name: t('Contacts'),
          statuses: [StatusEnum.NeverContacted, StatusEnum.ResearchContactInfo],
          color: 'color-error',
        },
        {
          id: uuidv4(),
          name: t('Call Backs'),
          statuses: [
            StatusEnum.CallForDecision,
            StatusEnum.ContactForAppointment,
          ],
          color: 'color-info',
        },
        {
          id: uuidv4(),
          name: t('Appointments'),
          statuses: [StatusEnum.AppointmentScheduled],
          color: 'color-warning',
        },
        {
          id: uuidv4(),
          name: t('Future Contacts'),
          statuses: [
            StatusEnum.PartnerPray,
            StatusEnum.PartnerSpecial,
            StatusEnum.PartnerPray,
            StatusEnum.AskInFuture,
            StatusEnum.NotInterested,
          ],
          color: 'color-success',
        },
        {
          id: uuidv4(),
          name: t('Maintaining'),
          statuses: [StatusEnum.CultivateRelationship],
          color: 'color-text',
        },
      ];
    default:
      return [
        {
          id: uuidv4(),
          name: getLocalizedPhase(t, PhaseEnum.Connection),
          statuses: getContactStatusesByPhase(PhaseEnum.Connection),
          color: 'color-warning',
        },
        {
          id: uuidv4(),
          name: getLocalizedPhase(t, PhaseEnum.Initiation),
          statuses: getContactStatusesByPhase(PhaseEnum.Initiation),
          color: 'color-info',
        },
        {
          id: uuidv4(),
          name: getLocalizedPhase(t, PhaseEnum.Appointment),
          statuses: getContactStatusesByPhase(PhaseEnum.Appointment),
          color: 'color-success',
        },
        {
          id: uuidv4(),
          name: getLocalizedPhase(t, PhaseEnum.FollowUp),
          statuses: getContactStatusesByPhase(PhaseEnum.FollowUp),
          color: 'color-warning',
        },
        {
          id: uuidv4(),
          name: getLocalizedPhase(t, PhaseEnum.PartnerCare),
          statuses: getContactStatusesByPhase(PhaseEnum.PartnerCare),
          color: 'color-success',
        },
        {
          id: uuidv4(),
          name: getLocalizedPhase(t, PhaseEnum.Archive),
          statuses: getContactStatusesByPhase(PhaseEnum.Archive),
          color: 'color-text',
        },
      ];
  }
};
