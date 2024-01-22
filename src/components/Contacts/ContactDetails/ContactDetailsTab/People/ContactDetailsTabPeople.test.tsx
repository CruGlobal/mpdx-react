import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { ContactsPage } from 'pages/accountLists/[accountListId]/contacts/ContactsPage';
import {
  render,
  waitFor,
  within,
} from '../../../../../../__tests__/util/testingLibraryReactMock';
import theme from '../../../../../theme';
import { ContactDetailProvider } from '../../ContactDetailContext';
import { ContactDetailsTabPeople } from './ContactDetailsTabPeople';
import {
  ContactPeopleFragment,
  ContactPeopleFragmentDoc,
} from './ContactPeople.generated';

const accountListId = '123';

const router = {
  query: { searchTerm: undefined, accountListId },
  push: jest.fn(),
};

const dates = {
  anniversaryDay: 1,
  anniversaryMonth: 1,
  anniversaryYear: 1980,
  birthdayDay: 1,
  birthdayMonth: 1,
  birthdayYear: 1950,
};

const primaryPerson = {
  id: 'person-1',
  firstName: 'Test',
  lastName: 'Person',
  primaryPhoneNumber: { number: '555-555-5555' },
  primaryEmailAddress: {
    email: 'testperson@fake.com',
  },
  phoneNumbers: {
    nodes: [
      {
        number: '111111111',
        location: 'Mobile',
        primary: true,
        historic: false,
        source: 'MPDX',
      },
      {
        number: '222222222',
        location: 'Work',
        primary: false,
        historic: false,
        source: 'MPDX',
      },
    ],
  },
  avatar: 'https://cru.org/assets/avatar.jpg',
  ...dates,
};

const data = gqlMock<ContactPeopleFragment>(ContactPeopleFragmentDoc, {
  mocks: {
    id: 'contactId',
    name: 'Person, Test',
    addresses: {
      nodes: [
        {
          id: '123',
          street: '123 Sesame Street',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',
          primaryMailingAddress: true,
          historic: true,
        },
        {
          id: '321',
          street: '4321 Sesame Street',
          city: 'Florida',
          state: 'FL',
          postalCode: '10001',
          country: 'USA',
          primaryMailingAddress: false,
          historic: false,
        },
      ],
    },
    tagList: ['tag1', 'tag2', 'tag3'],
    people: {
      nodes: [primaryPerson],
    },
    primaryPerson,
    website: 'testperson.com',
  },
});

describe('ContactDetailsTabPeople', () => {
  describe('ContactTags', () => {
    it('should render with tags', async () => {
      const { getByTestId } = render(
        <TestRouter router={router}>
          <GqlMockedProvider>
            <ThemeProvider theme={theme}>
              <ContactsPage>
                <ContactDetailProvider>
                  <ContactDetailsTabPeople
                    accountListId={accountListId}
                    data={data}
                  />
                </ContactDetailProvider>
              </ContactsPage>
            </ThemeProvider>
          </GqlMockedProvider>
        </TestRouter>,
      );
      await waitFor(() =>
        expect(getByTestId('ContactPersonAvatar')).toBeInTheDocument(),
      );
      const avatar = getByTestId('ContactPersonAvatar') as HTMLElement;
      const img = within(avatar).getByRole('img') as HTMLInputElement;
      expect(img.src).toEqual('https://cru.org/assets/avatar.jpg');
      expect(img.alt).toEqual('Test Person');
    });
  });

  describe('People', () => {
    it('should render the valid phone number with no errors showing', async () => {
      const { getByText, queryByText } = render(
        <TestRouter router={router}>
          <GqlMockedProvider>
            <ThemeProvider theme={theme}>
              <ContactsPage>
                <ContactDetailProvider>
                  <ContactDetailsTabPeople
                    accountListId={accountListId}
                    data={data}
                  />
                </ContactDetailProvider>
              </ContactsPage>
            </ThemeProvider>
          </GqlMockedProvider>
        </TestRouter>,
      );
      await waitFor(() => {
        expect(getByText('555-555-5555')).toBeInTheDocument();
        expect(
          queryByText('Test has one or multiple invalid numbers. Please fix.'),
        ).not.toBeInTheDocument();
        expect(
          queryByText('Invalid number. Please fix.'),
        ).not.toBeInTheDocument();
      });
    });

    describe('Invalid phone numbers', () => {
      const personMocks = {
        firstName: 'Test',
        primaryPhoneNumber: { number: null },
        phoneNumbers: {
          nodes: [{ number: null }],
        },
        ...dates,
      };
      const data = gqlMock<ContactPeopleFragment>(ContactPeopleFragmentDoc, {
        mocks: {
          primaryPerson: null,
          people: {
            nodes: [personMocks],
          },
        },
      });

      it('should render phone number invalid errors', async () => {
        const { getByText } = render(
          <TestRouter router={router}>
            <GqlMockedProvider>
              <ThemeProvider theme={theme}>
                <ContactsPage>
                  <ContactDetailProvider>
                    <ContactDetailsTabPeople
                      accountListId={accountListId}
                      data={data}
                    />
                  </ContactDetailProvider>
                </ContactsPage>
              </ThemeProvider>
            </GqlMockedProvider>
          </TestRouter>,
        );
        await waitFor(() => {
          expect(
            getByText('Test has one or multiple invalid numbers. Please fix.'),
          ).toBeInTheDocument();
          expect(getByText('Invalid number. Please fix.')).toBeInTheDocument();
        });
      });
    });
  });
});
