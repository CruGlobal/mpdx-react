import { TFunction } from 'i18next';
import { v4 as uuidv4 } from 'uuid';
import { ContactFilterStatusEnum } from 'src/graphql/types.generated';
import { getLocalizedContactStatus } from 'src/utils/functions/getLocalizedContactStatus';
import { ContactFlowOption } from './ContactFlow';

export const getDefaultFlowOptions = (t: TFunction): ContactFlowOption[] => {
  return [
    {
      id: uuidv4(),
      name: 'Connect',
      statuses: [
        getLocalizedContactStatus(t, ContactFilterStatusEnum.NeverContacted),
        getLocalizedContactStatus(t, ContactFilterStatusEnum.AskInFuture),
        getLocalizedContactStatus(
          t,
          ContactFilterStatusEnum.ResearchContactInfo,
        ),
        getLocalizedContactStatus(
          t,
          ContactFilterStatusEnum.CultivateRelationship,
        ),
      ],
      color: 'color-warning',
    },
    {
      id: uuidv4(),
      name: 'Initiation',
      statuses: [
        getLocalizedContactStatus(
          t,
          ContactFilterStatusEnum.ContactForAppointment,
        ),
      ],
      color: 'color-info',
    },
    {
      id: uuidv4(),
      name: 'Appointment',
      statuses: [
        getLocalizedContactStatus(
          t,
          ContactFilterStatusEnum.AppointmentScheduled,
        ),
      ],
      color: 'color-success',
    },
    {
      id: uuidv4(),
      name: 'Follow Up',
      statuses: [
        getLocalizedContactStatus(t, ContactFilterStatusEnum.CallForDecision),
      ],
      color: 'color-warning',
    },
    {
      id: uuidv4(),
      name: 'Partner Care',
      statuses: [
        getLocalizedContactStatus(t, ContactFilterStatusEnum.PartnerFinancial),
        getLocalizedContactStatus(t, ContactFilterStatusEnum.PartnerSpecial),
        getLocalizedContactStatus(t, ContactFilterStatusEnum.PartnerPray),
      ],
      color: 'color-success',
    },
    {
      id: uuidv4(),
      name: 'Archive',
      statuses: [
        getLocalizedContactStatus(t, ContactFilterStatusEnum.NotInterested),
        getLocalizedContactStatus(t, ContactFilterStatusEnum.Unresponsive),
        getLocalizedContactStatus(t, ContactFilterStatusEnum.NeverAsk),
        getLocalizedContactStatus(t, ContactFilterStatusEnum.ResearchAbandoned),
        getLocalizedContactStatus(t, ContactFilterStatusEnum.ExpiredReferral),
      ],
      color: 'color-text',
    },
  ];
};
