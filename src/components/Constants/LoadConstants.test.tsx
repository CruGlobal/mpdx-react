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

    expect(result.current).toMatchInlineSnapshot(mockConstants.data.constant);
  });
});
