import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { gqlMock } from '__tests__/util/graphqlMocking';
import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import { PledgeFrequencyEnum, StatusEnum } from 'src/graphql/types.generated';
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
        // Test time is pinned to 2020-01-01, so this is 60+ days late
        lateAt: '2019-10-01',
        pledgeStartDate: '2019-10-01',
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
  <ThemeProvider theme={theme}>
    <ContactHeaderStatusSection loading={loading} contact={contact} />
  </ThemeProvider>
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

  it('stacks the pledge and late status on their own lines', async () => {
    const { findByText } = render(
      <Components
        loading={false}
        contact={contactMock(StatusEnum.PartnerFinancial)}
      />,
    );

    expect(await findByText('$500 - Monthly')).toHaveStyle('display: block');
    // The late status label span is wrapped in a block-level Typography
    expect((await findByText('60+ days late')).parentElement).toHaveStyle(
      'display: block',
    );
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
