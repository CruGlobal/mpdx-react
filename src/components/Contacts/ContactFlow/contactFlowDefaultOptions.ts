import { TFunction } from 'i18next';
import { PhaseEnum, StatusEnum } from 'src/graphql/types.generated';
import { ContactFlowOption } from './ContactFlow';

export enum DefaultTypeEnum {
  Us = 'US',
  Global = 'GLOBAL',
}

export const getDefaultFlowOptions = (
  t: TFunction,
  getContactStatusesByPhase: (phase: string | null) => StatusEnum[],
  getLocalizedPhase: (phaseEnum: string | null | undefined) => string,
  type: DefaultTypeEnum = DefaultTypeEnum.Us,
): ContactFlowOption[] => {
  switch (type) {
    case DefaultTypeEnum.Global:
      return [
        {
          id: crypto.randomUUID(),
          name: t('Contacts'),
          statuses: [StatusEnum.NeverContacted, StatusEnum.ResearchContactInfo],
          color: 'color-error',
        },
        {
          id: crypto.randomUUID(),
          name: t('Call Backs'),
          statuses: [
            StatusEnum.CallForDecision,
            StatusEnum.ContactForAppointment,
          ],
          color: 'color-info',
        },
        {
          id: crypto.randomUUID(),
          name: t('Appointments'),
          statuses: [StatusEnum.AppointmentScheduled],
          color: 'color-warning',
        },
        {
          id: crypto.randomUUID(),
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
          id: crypto.randomUUID(),
          name: t('Maintaining'),
          statuses: [StatusEnum.CultivateRelationship],
          color: 'color-text',
        },
      ];
    default:
      return [
        {
          id: crypto.randomUUID(),
          name: getLocalizedPhase(PhaseEnum.Connection),
          statuses: getContactStatusesByPhase(PhaseEnum.Connection),
          color: 'color-warning',
        },
        {
          id: crypto.randomUUID(),
          name: getLocalizedPhase(PhaseEnum.Initiation),
          statuses: getContactStatusesByPhase(PhaseEnum.Initiation),
          color: 'color-info',
        },
        {
          id: crypto.randomUUID(),
          name: getLocalizedPhase(PhaseEnum.Appointment),
          statuses: getContactStatusesByPhase(PhaseEnum.Appointment),
          color: 'color-success',
        },
        {
          id: crypto.randomUUID(),
          name: getLocalizedPhase(PhaseEnum.FollowUp),
          statuses: getContactStatusesByPhase(PhaseEnum.FollowUp),
          color: 'color-warning',
        },
        {
          id: crypto.randomUUID(),
          name: getLocalizedPhase(PhaseEnum.PartnerCare),
          statuses: getContactStatusesByPhase(PhaseEnum.PartnerCare),
          color: 'color-success',
        },
        {
          id: crypto.randomUUID(),
          name: getLocalizedPhase(PhaseEnum.Archive),
          statuses: getContactStatusesByPhase(PhaseEnum.Archive),
          color: 'color-text',
        },
      ];
  }
};
