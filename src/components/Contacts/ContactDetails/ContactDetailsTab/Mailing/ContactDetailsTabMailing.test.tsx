import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { SendNewsletterEnum } from 'src/graphql/types.generated';
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
        state: null,
        street: '100 Lake Hart Dr',
        createdAt: new Date(2023, 0, 1).toISOString(),
        startDate: null,
      },
      {
        id: 'address-2',
        city: 'Orlando',
        country: 'USA',
        historic: false,
        location: '101 Lake Hart Dr',
        metroArea: null,
        postalCode: '32832',
        primaryMailingAddress: false,
        region: null,
        source: 'MPDX',
        state: null,
        street: '101 Lake Hart Dr',
        createdAt: new Date(2023, 0, 2).toISOString(),
        startDate: new Date(2023, 0, 30).toISOString(),
      },
    ],
  },
};

describe('ContactDetailsTabMailing', () => {
  it('shows address createdAt date', () => {
    const { getByText } = render(
      <TestRouter router={router}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <ContactDetailProvider>
              <ContactDetailsTabMailing
                accountListId={accountListId}
                data={data}
              />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>,
    );

    expect(getByText('Source: MPDX (Jan 1, 2023)')).toBeInTheDocument();
  });

  it('shows address startDate instead of createdAt date', () => {
    const { getByText } = render(
      <TestRouter router={router}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <ContactDetailProvider>
              <ContactDetailsTabMailing
                accountListId={accountListId}
                data={data}
              />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>,
    );
    userEvent.click(getByText('Show 1 More'));
    expect(getByText('Source: MPDX (Jan 30, 2023)')).toBeInTheDocument();
  });

  it('does not show state if null', () => {
    const { getByText, getByTestId } = render(
      <TestRouter router={router}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <ContactDetailProvider>
              <ContactDetailsTabMailing
                accountListId={accountListId}
                data={data}
              />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>,
    );

    expect(getByText('Orlando, 32832')).toBeInTheDocument();

    userEvent.click(getByText('Show 1 More'));
    const { getByText: getByTextInTestId } = within(
      getByTestId('NonPrimaryAddresses'),
    );
    expect(getByTextInTestId('Orlando, 32832')).toBeInTheDocument();
  });

  it('shows state if present', () => {
    data.addresses.nodes[0].state = 'FL';
    data.addresses.nodes[1].state = 'FL';

    const { getByText, getByTestId } = render(
      <TestRouter router={router}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <ContactDetailProvider>
              <ContactDetailsTabMailing
                accountListId={accountListId}
                data={data}
              />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>,
    );

    expect(getByText('Orlando, FL 32832')).toBeInTheDocument();

    userEvent.click(getByText('Show 1 More'));
    const { getByText: getByTextInTestId } = within(
      getByTestId('NonPrimaryAddresses'),
    );
    expect(getByTextInTestId('Orlando, FL 32832')).toBeInTheDocument();
  });
});
