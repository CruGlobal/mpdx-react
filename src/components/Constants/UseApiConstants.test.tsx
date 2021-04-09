import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '../../../__tests__/util/graphqlMocking';
import { useApiConstants } from './UseApiConstants';

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
            "id": "Signature Pepper Pants",
            "value": "Maze Box",
          },
        ],
        "likelyToGiveOptions": Array [
          Object {
            "__typename": "IdValue",
            "id": "Cave Vacuum",
            "value": "Film",
          },
        ],
        "locations": Array [
          Object {
            "__typename": "IdValue",
            "id": "Computer Swimming Pool Chess Board",
          },
          Object {
            "__typename": "IdValue",
            "id": "Alphabet",
          },
          Object {
            "__typename": "IdValue",
            "id": "Aircraft Carrier",
          },
        ],
        "pledgeCurrencies": Array [
          Object {
            "__typename": "IdKeyValue",
            "id": "Microscope Chocolates Snail",
            "value": "Film Vampire",
          },
        ],
        "pledgeFrequencies": Array [
          Object {
            "__typename": "IdKeyValue",
            "id": "Pyramid",
            "value": "Sun Kaleidoscope Ears",
          },
        ],
        "pledgesReceived": Array [
          Object {
            "__typename": "IdValue",
            "id": "Sphere Umbrella",
            "value": "Vacuum Pebble Spice",
          },
          Object {
            "__typename": "IdValue",
            "id": "Swimming Pool Ice",
            "value": "Festival Rocket",
          },
          Object {
            "__typename": "IdValue",
            "id": "Plane Box Chief",
            "value": "Navy",
          },
          Object {
            "__typename": "IdValue",
            "id": "Festival Bathtub",
            "value": "Triangle",
          },
        ],
        "preferredContactMethods": Array [
          Object {
            "__typename": "IdKeyValue",
            "id": "Compass Carpet Explosive",
            "value": "Army Train PaintBrush",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Sports-car",
            "value": "Clown Game",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Airforce",
            "value": "Potato Foot",
          },
        ],
        "sendAppeals": Array [
          Object {
            "__typename": "IdValue",
            "id": "Pillow",
            "value": "Arm",
          },
          Object {
            "__typename": "IdValue",
            "id": "Snail",
            "value": "Airport",
          },
          Object {
            "__typename": "IdValue",
            "id": "Rock",
            "value": "Tapestry",
          },
          Object {
            "__typename": "IdValue",
            "id": "Pepper Apple",
            "value": "Magnet Apple",
          },
        ],
        "sendNewsletterOptions": Array [
          Object {
            "__typename": "IdValue",
            "id": "Mist",
            "value": "Comet Post-office Garden",
          },
          Object {
            "__typename": "IdValue",
            "id": "Hose Fruit Highway",
            "value": "Money $$$$",
          },
          Object {
            "__typename": "IdValue",
            "id": "Child",
            "value": "Printer Magnet Dung",
          },
          Object {
            "__typename": "IdValue",
            "id": "Sword",
            "value": "Staircase Pillow",
          },
        ],
        "statuses": Array [
          Object {
            "__typename": "IdValue",
            "id": "Mouth Feather",
            "value": "Leather jacket Window",
          },
          Object {
            "__typename": "IdValue",
            "id": "Shop Square",
            "value": "Album Bed",
          },
          Object {
            "__typename": "IdValue",
            "id": "Pendulum Butterfly",
            "value": "Finger Rock Garden",
          },
        ],
        "times": Array [
          Object {
            "__typename": "Time",
            "key": 32,
            "value": "Snail Hose",
          },
          Object {
            "__typename": "Time",
            "key": 53,
            "value": "Weapon",
          },
          Object {
            "__typename": "Time",
            "key": 15,
            "value": "Spice",
          },
        ],
      }
    `);
  });
});
