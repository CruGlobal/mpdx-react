import {
  PledgeFrequencyEnum,
  SendNewsletterEnum,
  StatusEnum,
} from '../../../../graphql/types.generated';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import { coordinatesFromContacts, getRedirectPathname } from './helpers';

const accountListId = 'account-list-1';

describe('getRedirectPathname', () => {
  describe('on contacts page', () => {
    const routerPathname =
      '/accountLists/[accountListId]/contacts/[[...contactId]]';
    const contactId = 'contact-1';

    it('with no contact id or view', () => {
      const pathname = getRedirectPathname({
        routerPathname,
        accountListId,
      });

      expect(pathname).toBe('/accountLists/account-list-1/contacts');
    });

    it('with list view', () => {
      const pathname = getRedirectPathname({
        routerPathname,
        accountListId,
        viewMode: TableViewModeEnum.List,
      });

      expect(pathname).toBe('/accountLists/account-list-1/contacts');
    });

    it('with flows view', () => {
      const pathname = getRedirectPathname({
        routerPathname,
        accountListId,
        viewMode: TableViewModeEnum.Flows,
      });

      expect(pathname).toBe('/accountLists/account-list-1/contacts/flows');
    });

    it('with map view', () => {
      const pathname = getRedirectPathname({
        routerPathname,
        accountListId,
        viewMode: TableViewModeEnum.Map,
      });

      expect(pathname).toBe('/accountLists/account-list-1/contacts/map');
    });

    it('with contact id and no view', () => {
      const pathname = getRedirectPathname({
        routerPathname,
        accountListId,
        contactId,
      });

      expect(pathname).toBe('/accountLists/account-list-1/contacts/contact-1');
    });

    it('with contact id list view', () => {
      const pathname = getRedirectPathname({
        routerPathname,
        accountListId,
        contactId,
        viewMode: TableViewModeEnum.List,
      });

      expect(pathname).toBe('/accountLists/account-list-1/contacts/contact-1');
    });

    it('with contact id flows view', () => {
      const pathname = getRedirectPathname({
        routerPathname,
        accountListId,
        contactId,
        viewMode: TableViewModeEnum.Flows,
      });

      expect(pathname).toBe(
        '/accountLists/account-list-1/contacts/flows/contact-1',
      );
    });

    it('with contact id map view', () => {
      const pathname = getRedirectPathname({
        routerPathname,
        accountListId,
        contactId,
        viewMode: TableViewModeEnum.Map,
      });

      expect(pathname).toBe(
        '/accountLists/account-list-1/contacts/map/contact-1',
      );
    });
  });

  it('should return the tasks URL when user is on the tasks page', () => {
    // I tried to test this through rendering the component,
    // I couldn't work it out so I'm just testing the function instead.
    const pathname = getRedirectPathname({
      routerPathname: '/accountLists/[accountListId]/tasks/[[...contactId]]',
      accountListId,
    });

    expect(pathname).toBe('/accountLists/account-list-1/tasks');
  });

  it('should return the donations report URL when user is on the partner donations report page', () => {
    const pathname = getRedirectPathname({
      routerPathname:
        '/accountLists/[accountListId]/reports/donations/[[...contactId]]',
      accountListId,
    });

    expect(pathname).toBe('/accountLists/account-list-1/reports/donations');
  });

  it('should return the partner giving analysis URL when user is on the partner giving analysis page', () => {
    const pathname = getRedirectPathname({
      routerPathname:
        '/accountLists/[accountListId]/reports/partnerGivingAnalysis/[[...contactId]]',
      accountListId,
    });

    expect(pathname).toBe(
      '/accountLists/account-list-1/reports/partnerGivingAnalysis',
    );
  });

  it('should return the partner currency URL when user is on the partnerCurrency 14 month report page', () => {
    const pathname = getRedirectPathname({
      routerPathname:
        '/accountLists/[accountListId]/reports/partnerCurrency/[[...contactId]]',
      accountListId,
    });

    expect(pathname).toBe(
      '/accountLists/account-list-1/reports/partnerCurrency',
    );
  });

  it('should return the salary currency URL when user is on the salaryCurrency 14 month report page', () => {
    const pathname = getRedirectPathname({
      routerPathname:
        '/accountLists/[accountListId]/reports/salaryCurrency/[[...contactId]]',
      accountListId,
    });

    expect(pathname).toBe(
      '/accountLists/account-list-1/reports/salaryCurrency',
    );
  });
});

describe('coordinatesFromContacts', () => {
  it('generates coordinates', () => {
    const otherFields = {
      pledgeAmount: 100,
      pledgeFrequency: PledgeFrequencyEnum.Monthly,
      pledgeCurrency: 'USD',
      pledgeReceived: true,
      sendNewsletter: SendNewsletterEnum.Both,
      starred: false,
      uncompletedTasksCount: 0,
      people: { nodes: [] },
    };

    const result = coordinatesFromContacts(
      {
        nodes: [
          {
            id: 'contact-no-address',
            name: 'Contact No Address',
            avatar: 'https://example.com/1.jpg',
            ...otherFields,
          },
          {
            id: 'contact-address-no-geo',
            name: 'Contact Address No Geo',
            avatar: 'https://example.com/2.jpg',
            primaryAddress: {
              id: 'address-1',
              street: '123 Main St',
              city: 'Orlando',
              state: 'FL',
              country: 'USA',
              postalCode: '32832',
              source: 'MPDX',
              createdAt: '2023-01-01T00:00:00.000Z',
            },
            ...otherFields,
          },
          {
            id: 'contact-address',
            name: 'Contact Address',
            avatar: 'https://example.com/3.jpg',
            status: StatusEnum.PartnerFinancial,
            primaryAddress: {
              id: 'address-2',
              street: '123 Main St',
              city: 'Orlando',
              state: 'FL',
              country: 'USA',
              postalCode: '32832',
              source: 'MPDX',
              geo: '32.1,-60',
              createdAt: '2023-01-01T00:00:00.000Z',
            },
            ...otherFields,
          },
        ],
        totalCount: 3,
        pageInfo: {
          hasNextPage: false,
        },
      },
      'en-US',
    );

    expect(result).toEqual([
      {
        id: 'contact-no-address',
        name: 'Contact No Address',
        avatar: 'https://example.com/1.jpg',
      },
      {
        id: 'contact-address-no-geo',
        name: 'Contact Address No Geo',
        avatar: 'https://example.com/2.jpg',
      },
      {
        id: 'contact-address',
        name: 'Contact Address',
        avatar: 'https://example.com/3.jpg',
        status: 'PARTNER_FINANCIAL',
        street: '123 Main St',
        city: 'Orlando',
        state: 'FL',
        country: 'USA',
        postal: '32832',
        source: 'MPDX',
        lat: 32.1,
        lng: -60,
        date: expect.any(String),
      },
    ]);
  });
});
