import { useQuery } from '@apollo/client';
import { renderHook } from '@testing-library/react-hooks';
import { useApiConstants } from './UseConstants';

jest.mock('@apollo/client');

const mockConstants = {
  data: {
    constant: {
      activities: [],
      likelyToGiveOptions: [],
      locations: [],
      notifications: [],
      pledgeCurrencies: [],
      pledgeFrequencies: [],
      pledgesReceived: [],
      preferredContactMethods: [],
      sendAppeals: [],
      sendNewsletterOptions: [],
      statuses: [],
      times: [],
      userNotificationTitles: [],
    },
  },
};

describe('LoadConstants', () => {
  it('query correct', () => {
    (useQuery as jest.Mock).mockReturnValue(mockConstants);

    const { result } = renderHook(() => useApiConstants());

    expect(useQuery).toHaveBeenCalledWith(undefined, {
      fetchPolicy: 'cache-first',
    });

    expect(result.current).toMatchInlineSnapshot(`
        Object {
          "activities": Array [],
          "likelyToGiveOptions": Array [],
          "locations": Array [],
          "notifications": Array [],
          "pledgeCurrencies": Array [],
          "pledgeFrequencies": Array [],
          "pledgesReceived": Array [],
          "preferredContactMethods": Array [],
          "sendAppeals": Array [],
          "sendNewsletterOptions": Array [],
          "statuses": Array [],
          "times": Array [],
          "userNotificationTitles": Array [],
        }
    `);
  });
});
