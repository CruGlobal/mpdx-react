export class ContactsMocks {
  contact = {
    id: '2f5d998f',
    name: 'Lastname, Firstnames',
    squareAvatar: 'https://stage.mpdx.org/images/avatar.png',
    people: [
      {
        firstName: 'firstName',
        lastName: 'lastName',
        deceased: false,
        emailAddresses: [
          {
            email: 'test@cru.org',
            primary: true,
            historic: false,
          },
        ],
        phoneNumbers: [
          {
            number: '(111) 222-3333',
            primary: true,
            historic: false,
          },
        ],
      },
      {
        firstName: 'firstName2',
        lastName: 'lastName2',
        deceased: false,
        emailAddresses: [],
        phoneNumbers: [],
      },
    ],
    accountList: {
      name: 'Daniel Bisgrove',
      accountListUsers: [
        {
          id: '123456',
          userFirstName: 'accountListFirstName',
          userLastName: 'accountListLastName',
          userEmailAddresses: [
            { email: 'accountList.contactOwner@cru.org', primary: true },
          ],
        },
        {
          id: '654321',
          userFirstName: 'accountListFirstName2',
          userLastName: 'accountListLastName2',
          userEmailAddresses: [],
        },
      ],
    },
    addresses: [
      {
        primaryMailingAddress: 'true',
        street: '111 test',
        city: 'city',
        state: 'GA',
        postalCode: '11111',
      },
      {
        primaryMailingAddress: 'false',
        street: '222 test',
        city: 'city',
        state: 'FL',
        postalCode: '22222',
      },
    ],
  };
}
