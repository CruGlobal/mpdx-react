import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { LoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import { PledgeFrequencyEnum, StatusEnum } from 'src/graphql/types.generated';
import i18n from '../../../../../lib/i18n';
import theme from '../../../../../theme';
import {
  ContactDetailsHeaderFragment,
  ContactDetailsHeaderFragmentDoc,
} from '../ContactDetailsHeader.generated';
import { ContactHeaderStatusFragment } from './ContactHeaderStatus.generated';
import { ContactHeaderStatusSection } from './ContactHeaderStatusSection';

const contactMock = (status: StatusEnum) => {
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

interface ComponentsProps {
  loading: boolean;
  contact: ContactHeaderStatusFragment | undefined;
}

const Components = ({ loading, contact }: ComponentsProps) => (
  <GqlMockedProvider<{
    LoadConstants: LoadConstantsQuery;
  }>
    mocks={{ LoadConstants: loadConstantsMockData }}
  >
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <ContactHeaderStatusSection loading={loading} contact={contact} />
      </I18nextProvider>
    </ThemeProvider>
  </GqlMockedProvider>
);

describe('ContactHeaderStatusSection', () => {
  it('should show loading state', () => {
    const { queryByText } = render(
      <Components loading={true} contact={undefined} />,
    );

    expect(queryByText('Partner - Financial')).toBeNull();
  });

  it('should render if status is null', () => {
    const { queryByText } = render(
      <Components
        loading={false}
        contact={gqlMock<ContactDetailsHeaderFragment>(
          ContactDetailsHeaderFragmentDoc,
          { mocks: { status: null, lastDonation: null } },
        )}
      />,
    );

    expect(queryByText('Partner - Financial')).toBeNull();
  });

  it('renders for financial partner', async () => {
    const { queryByText, findByText } = render(
      <Components
        loading={false}
        contact={contactMock(StatusEnum.PartnerFinancial)}
      />,
    );
    expect(await findByText('Partner - Financial')).toBeInTheDocument();
    expect(queryByText('$500 - Monthly')).toBeInTheDocument();
  });

  const statuses = Object.values(StatusEnum).map((status) => {
    return [
      status,
      loadConstantsMockData.constant.status?.find((s) => s.id === status)
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
