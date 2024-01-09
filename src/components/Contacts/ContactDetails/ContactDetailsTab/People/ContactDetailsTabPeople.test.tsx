import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { DeepPartial } from 'ts-essentials';
import { ContactsPage } from 'pages/accountLists/[accountListId]/contacts/ContactsPage';
import TestRouter from '../../../../../../__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import {
  render,
  waitFor,
  within,
} from '../../../../../../__tests__/util/testingLibraryReactMock';
import theme from '../../../../../theme';
import { ContactDetailProvider } from '../../ContactDetailContext';
import { ContactDetailsTabQuery } from '../ContactDetailsTab.generated';
import { ContactDetailsTabPeople } from './ContactDetailsTabPeople';

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
  avatar: 'https://cru.org/assets/avatar.jpg',
  ...dates,
};

const data: DeepPartial<ContactDetailsTabQuery> = {
  contact: {
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
};

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
                  data={data.contact as any}
                />
              </ContactDetailProvider>
            </ContactsPage>
          </ThemeProvider>
        </GqlMockedProvider>
        ,
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
