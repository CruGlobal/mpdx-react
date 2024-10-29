import { TFunction } from 'i18next';
import { v4 as uuidv4 } from 'uuid';
import { Phase, PhaseEnum, StatusEnum } from 'src/graphql/types.generated';
import { ContactFlowOption } from './ContactFlow';

export enum DefaultTypeEnum {
  Us = 'US',
  Global = 'GLOBAL',
}

export const getDefaultFlowOptions = (
  t: TFunction,
  getContactStatusesByPhase: (phase: string | null) => StatusEnum[],
  phases: Phase[] | undefined | null,
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
          name:
            phases?.find((phase) => phase?.id === PhaseEnum.Connection)?.name ||
            '',
          statuses: getContactStatusesByPhase(PhaseEnum.Connection),
          color: 'color-warning',
        },
        {
          id: uuidv4(),
          name:
            phases?.find((phase) => phase?.id === PhaseEnum.Initiation)?.name ||
            '',
          statuses: getContactStatusesByPhase(PhaseEnum.Initiation),
          color: 'color-info',
        },
        {
          id: uuidv4(),
          name:
            phases?.find((phase) => phase?.id === PhaseEnum.Appointment)
              ?.name || '',
          statuses: getContactStatusesByPhase(PhaseEnum.Appointment),
          color: 'color-success',
        },
        {
          id: uuidv4(),
          name:
            phases?.find((phase) => phase?.id === PhaseEnum.FollowUp)?.name ||
            '',
          statuses: getContactStatusesByPhase(PhaseEnum.FollowUp),
          color: 'color-warning',
        },
        {
          id: uuidv4(),
          name:
            phases?.find((phase) => phase?.id === PhaseEnum.PartnerCare)
              ?.name || '',
          statuses: getContactStatusesByPhase(PhaseEnum.PartnerCare),
          color: 'color-success',
        },
        {
          id: uuidv4(),
          name:
            phases?.find((phase) => phase?.id === PhaseEnum.Archive)?.name ||
            '',
          statuses: getContactStatusesByPhase(PhaseEnum.Archive),
          color: 'color-text',
        },
      ];
  }
};
