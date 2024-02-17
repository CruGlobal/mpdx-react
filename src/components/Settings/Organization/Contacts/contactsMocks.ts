export class ContactsMocks {
  contact = {
    allowDeletion: true,
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
          firstName: 'accountListFirstName',
          lastName: 'accountListLastName',
          emailAddresses: [],
        },
        {
          id: '654321',
          firstName: 'accountListFirstName2',
          lastName: 'accountListLastName2',
          emailAddresses: [],
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
