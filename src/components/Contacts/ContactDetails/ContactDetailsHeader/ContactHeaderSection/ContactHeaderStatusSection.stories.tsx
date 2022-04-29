import { StatusEnum } from 'graphql/types.generated';
import { DateTime } from 'luxon';
import React, { ReactElement } from 'react';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';

import {
  ContactDetailsHeaderFragment,
  ContactDetailsHeaderFragmentDoc,
} from '../ContactDetailsHeader.generated';
import { ContactHeaderStatusSection } from './ContactHeaderStatusSection';

export default {
  title: 'Contacts/ContactDetails/Header/StatusSection',
  argTypes: {
    statusType: {
      options: [
        StatusEnum.PartnerFinancial,
        StatusEnum.AppointmentScheduled,
        StatusEnum.NeverAsk,
      ],
      control: { type: 'radio' },
    },
  },
};

export const Default = ({
  statusType,
}: {
  statusType: StatusEnum;
}): ReactElement => {
  const contact = gqlMock<ContactDetailsHeaderFragment>(
    ContactDetailsHeaderFragmentDoc,
    {
      mocks: {
        status: statusType,
        pledgeCurrency: 'USD',
        lastDonation: {
          donationDate: DateTime.now().plus({ month: 5 }).toISO(),
        },
        lateAt: DateTime.now().minus({ month: 5 }).toISO(),
      },
    },
  );

  return <ContactHeaderStatusSection loading={false} contact={contact} />;
};

export const Loading = (): ReactElement => {
  return <ContactHeaderStatusSection loading={true} contact={undefined} />;
};

Default.args = {
  statusType: StatusEnum.PartnerFinancial,
};
