import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  ContactMailingFragment,
  ContactMailingFragmentDoc,
} from '../ContactMailing.generated';
import {
  DonationServicesEmailDocument,
  DonationServicesEmailQuery,
  DonationServicesEmailQueryVariables,
} from './EditContactAddress.generated';
import { generateEmailBody } from './helpers';

describe('generateEmailBody', () => {
  const emailData = gqlMock<
    DonationServicesEmailQuery,
    DonationServicesEmailQueryVariables
  >(DonationServicesEmailDocument, {
    mocks: {
      user: {
        firstName: 'User',
      },
      contact: {
        name: 'Contact',
      },
    },
    variables: {
      accountListId: '123',
      contactId: '123',
    },
  });

  it("contains the user's name and the contact's name", () => {
    const address = gqlMock<ContactMailingFragment>(ContactMailingFragmentDoc)
      .addresses.nodes[0];

    const emailBody = generateEmailBody(emailData, address);
    expect(emailBody).toContain('User');
    expect(emailBody).toContain('Contact');
  });

  it('includes ministry partner account number when present', () => {
    const address = gqlMock<ContactMailingFragment>(ContactMailingFragmentDoc, {
      mocks: {
        addresses: {
          nodes: [
            {
              sourceDonorAccount: {
                accountNumber: '123456789',
              },
            },
          ],
        },
      },
    }).addresses.nodes[0];

    expect(generateEmailBody(emailData, address)).toContain('123456789');
  });

  it('includes ministry partner name even when account number is not present', () => {
    const address = gqlMock<ContactMailingFragment>(ContactMailingFragmentDoc, {
      mocks: {
        addresses: {
          nodes: [
            {
              sourceDonorAccount: null,
            },
          ],
        },
      },
    }).addresses.nodes[0];

    expect(generateEmailBody(emailData, address)).toContain('Contact');
  });

  it('includes address when present', () => {
    const address = gqlMock<ContactMailingFragment>(ContactMailingFragmentDoc, {
      mocks: {
        addresses: {
          nodes: [
            {
              street: '100 Lake Hart Dr',
            },
          ],
        },
      },
    }).addresses.nodes[0];

    expect(generateEmailBody(emailData, address)).toContain('100 Lake Hart Dr');
  });

  it('handles missing address address', () => {
    const address = gqlMock<ContactMailingFragment>(ContactMailingFragmentDoc, {
      mocks: {
        addresses: {
          nodes: [
            {
              street: null,
              city: null,
              state: null,
              postalCode: null,
            },
          ],
        },
      },
    }).addresses.nodes[0];

    expect(generateEmailBody(emailData, address)).toContain(
      'Please update their address to',
    );
  });
});
