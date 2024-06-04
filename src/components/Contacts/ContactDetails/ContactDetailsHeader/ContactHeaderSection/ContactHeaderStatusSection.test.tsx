import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import { PledgeFrequencyEnum, StatusEnum } from 'src/graphql/types.generated';
import i18n from '../../../../../lib/i18n';
import theme from '../../../../../theme';
import {
  ContactDetailsHeaderFragment,
  ContactDetailsHeaderFragmentDoc,
} from '../ContactDetailsHeader.generated';
import { ContactHeaderStatusSection } from './ContactHeaderStatusSection';

const contactMock = (status: ContactPartnershipStatusEnum) => {
  return gqlMock<ContactDetailsHeaderFragment>(
    ContactDetailsHeaderFragmentDoc,
    {
      mocks: {
        status,
        pledgeCurrency: 'USD',
        pledgeAmount: 500,
        pledgeFrequency: PledgeFrequencyEnum.Monthly,
        pledgeReceived: true,
        lastDonation: {
          donationDate: '2021-09-07T16:38:20.242-04:00',
          amount: {
            currency: 'CAD',
          },
        },
        contactReferralsToMe: {
          nodes: [
            {
              id: 'referred-by-id-1',
              referredBy: {
                id: 'referred-by-contact-id',
                name: 'Person, Cool',
              },
            },
          ],
        },
      },
    },
  );
};

describe('ContactHeaderStatusSection', () => {
  it('should show loading state', () => {
    const { queryByText } = render(
      <ContactHeaderStatusSection loading={true} contact={undefined} />,
    );

    expect(queryByText('Partner - Financial')).toBeNull();
  });

  it('should render if status is null', () => {
    const { queryByText } = render(
      <ContactHeaderStatusSection
        loading={false}
        contact={gqlMock<ContactDetailsHeaderFragment>(
          ContactDetailsHeaderFragmentDoc,
          { mocks: { status: null, lastDonation: null } },
        )}
      />,
    );

    expect(queryByText('Partner - Financial')).toBeNull();
  });

  it('renders for financial partner', () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <ContactHeaderStatusSection
          loading={false}
          contact={contactMock(
            'PARTNER_FINANCIAL' as ContactPartnershipStatusEnum,
          )}
        />
      </ThemeProvider>,
    );
    expect(queryByText('Partner - Financial')).toBeInTheDocument();
    expect(queryByText('$500 - Monthly')).toBeInTheDocument();
  });

  const statuses = Object.entries(StatusEnum).map(([_, status]) => {
    return [
      status,
      loadConstantsMockData.constant.statuses?.find((s) => s.id === status)
        ?.value || '',
    ];
  });

  it.each([...statuses])(
    'should render status | %s',
    async (status, expected) => {
      const { findByText } = render(
        <Components
            loading={false}
          contact={contactMock(status as StatusEnum)}
        />,
    );
      expect(await findByText(expected)).toBeInTheDocument();
    },
  );
});
