import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { ContactsPage } from 'pages/accountLists/[accountListId]/contacts/ContactsPage';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import TestRouter from '__tests__/util/TestRouter';
import { SendNewsletterEnum } from '../../../../../../graphql/types.generated';
import theme from '../../../../../theme';
import { ContactDetailProvider } from '../../ContactDetailContext';
import { ContactDetailsTabMailing } from './ContactDetailsTabMailing';
import { ContactMailingFragment } from './ContactMailing.generated';

const accountListId = 'account-list-1';
const router = {
  query: { accountListId },
};

const data: ContactMailingFragment = {
  id: 'contact-1',
  name: 'John Doe',
  greeting: 'John',
  envelopeGreeting: 'John Doe',
  sendNewsletter: SendNewsletterEnum.None,
  addresses: {
    nodes: [
      {
        id: 'address-1',
        city: 'Orlando',
        country: 'USA',
        historic: false,
        location: '100 Lake Hart Dr',
        metroArea: null,
        postalCode: '32832',
        primaryMailingAddress: true,
        region: null,
        source: 'MPDX',
        state: 'FL',
        street: '100 Lake Hart Dr',
        createdAt: new Date(2023, 0, 1).toISOString(),
      },
    ],
  },
};

describe('ContactDetailsTabMailing', () => {
  it('shows address date', () => {
    const { getByText } = render(
      <TestRouter router={router}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <ContactsPage>
              <ContactDetailProvider>
                <ContactDetailsTabMailing
                  accountListId={accountListId}
                  data={data}
                />
              </ContactDetailProvider>
            </ContactsPage>
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>,
    );

    expect(getByText('Source: MPDX (Jan 1, 2023)')).toBeInTheDocument();
  });
});
