import { ExcludedAppealContactReasonEnum } from 'src/graphql/types.generated';

export const contactId = 'contactID';

export const defaultExcludedContacts = [
  {
    id: 'id1',
    contact: {
      id: contactId,
    },
    reasons: [ExcludedAppealContactReasonEnum.NoAppeals],
  },
  {
    id: 'id2',
    contact: {
      id: 'contactID2',
    },
    reasons: [
      ExcludedAppealContactReasonEnum.GaveMoreThanPledgedRange,
      ExcludedAppealContactReasonEnum.StoppedGivingRange,
    ],
  },
];
