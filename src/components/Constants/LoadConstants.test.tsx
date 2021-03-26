import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '../../../__tests__/util/graphqlMocking';
import { useApiConstants } from './UseConstants';

describe('LoadConstants', () => {
  it('query correct', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useApiConstants(), {
      wrapper: GqlMockedProvider,
    });

    await waitForNextUpdate();

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "__typename": "Constant",
        "activities": Array [
          Object {
            "__typename": "IdValue",
            "id": "Sphere Box",
            "value": "Bridge",
          },
          Object {
            "__typename": "IdValue",
            "id": "Chisel",
            "value": "Shoes",
          },
          Object {
            "__typename": "IdValue",
            "id": "Man Spice Vulture",
            "value": "Roof Car-race Freeway",
          },
        ],
        "likelyToGiveOptions": Array [
          Object {
            "__typename": "IdValue",
            "id": "Rifle",
            "value": "Spice Apple",
          },
        ],
        "locations": Array [
          Object {
            "__typename": "IdValue",
            "id": "Hammer",
            "value": "Swimming Pool",
          },
          Object {
            "__typename": "IdValue",
            "id": "Highway Onion",
            "value": "Boy Adult",
          },
          Object {
            "__typename": "IdValue",
            "id": "Needle Saddle",
            "value": "Jet fighter Cycle Pebble",
          },
        ],
        "notifications": Array [
          Object {
            "__typename": "IdKeyValue",
            "id": "Eyes",
            "value": "Dung Shop",
          },
        ],
        "pledgeCurrencies": Array [
          Object {
            "__typename": "IdKeyValue",
            "id": "Pocket Balloon",
            "value": "Family",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Bank",
            "value": "Aircraft Carrier Onion Crystal",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Family",
            "value": "Salt",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Flower Bathtub Mist",
            "value": "Compass",
          },
        ],
        "pledgeFrequencies": Array [
          Object {
            "__typename": "IdKeyValue",
            "id": "Saddle Hat Prison",
            "value": "Game Hose Rope",
          },
        ],
        "pledgesReceived": Array [
          Object {
            "__typename": "IdValue",
            "id": "Fungus Foot Chief",
            "value": "Drum Gloves",
          },
        ],
        "preferredContactMethods": Array [
          Object {
            "__typename": "IdKeyValue",
            "id": "Bank Plane",
            "value": "Chisel Fan Meteor",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Horoscope",
            "value": "Vulture Jet fighter",
          },
        ],
        "sendAppeals": Array [
          Object {
            "__typename": "IdValue",
            "id": "Swimming Pool",
            "value": "Army Carrot",
          },
          Object {
            "__typename": "IdValue",
            "id": "Rocket Computer Boy",
            "value": "Fire Typewriter Apple",
          },
          Object {
            "__typename": "IdValue",
            "id": "Hammer",
            "value": "Swimming Pool",
          },
        ],
        "sendNewsletterOptions": Array [
          Object {
            "__typename": "IdValue",
            "id": "Mist",
            "value": "Dress Square",
          },
          Object {
            "__typename": "IdValue",
            "id": "Mosquito Fan",
            "value": "Rifle Cappuccino Computer",
          },
        ],
        "statuses": Array [
          Object {
            "__typename": "IdValue",
            "id": "Bottle Brain Sandpaper",
            "value": "Fan Girl",
          },
          Object {
            "__typename": "IdValue",
            "id": "Drum Slave",
            "value": "Knife",
          },
          Object {
            "__typename": "IdValue",
            "id": "Money $$$$ Liquid",
            "value": "Sun",
          },
          Object {
            "__typename": "IdValue",
            "id": "Bridge Insect Woman",
            "value": "Horoscope Fruit",
          },
        ],
        "times": Array [
          Object {
            "__typename": "Time",
            "key": 66,
            "value": "Surveyor Prison",
          },
        ],
        "userNotificationTitles": Array [
          Object {
            "__typename": "IdKeyValue",
            "id": "Air Typewriter",
            "value": "Girl Toilet Circle",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Meat Brain",
            "value": "Drill Baby Drill",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Gas Spoon Bed",
            "value": "Feather Aircraft Carrier Bed",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Sex Sunglasses Maze",
            "value": "Teeth",
          },
        ],
      }
    `);
  });
});
