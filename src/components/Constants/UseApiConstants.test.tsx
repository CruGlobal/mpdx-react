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
            "id": "Weapon Aeroplane",
            "value": "Chocolates Bomb",
          },
          Object {
            "__typename": "IdValue",
            "id": "Girl",
            "value": "Rainbow",
          },
        ],
        "languages": Array [
          Object {
            "__typename": "IdValue",
            "id": "Chess Board Elephant",
            "value": "Cycle",
          },
          Object {
            "__typename": "IdValue",
            "id": "Fire Aeroplane Highway",
            "value": "Satellite Necklace Shower",
          },
        ],
        "likelyToGiveOptions": Array [
          Object {
            "__typename": "IdValue",
            "id": "Drink Baby Data Base",
            "value": "Gas Drink Meat",
          },
          Object {
            "__typename": "IdValue",
            "id": "Spot Light Grapes Bed",
            "value": "Bottle",
          },
          Object {
            "__typename": "IdValue",
            "id": "Guitar",
            "value": "Foot",
          },
        ],
        "locations": Array [
          Object {
            "__typename": "IdValue",
            "id": "Spectrum",
          },
          Object {
            "__typename": "IdValue",
            "id": "Bed",
          },
          Object {
            "__typename": "IdValue",
            "id": "Potato X-ray",
          },
          Object {
            "__typename": "IdValue",
            "id": "Library Flower Torpedo",
          },
        ],
        "pledgeCurrencies": Array [
          Object {
            "__typename": "IdKeyValue",
            "id": "Car-race Spectrum",
            "value": "Floodlight Earth Foot",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Saddle Thermometer Tennis racquet",
            "value": "Plane Teeth Garden",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Maze Hat",
            "value": "Sandpaper",
          },
        ],
        "pledgeFrequencies": Array [
          Object {
            "__typename": "IdKeyValue",
            "id": "Rifle Microscope",
            "value": "Foot Aeroplane",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Highway",
            "value": "Apple",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Boy",
            "value": "Umbrella",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Ring Ice Drink",
            "value": "Egg Perfume",
          },
        ],
        "pledgesReceived": Array [
          Object {
            "__typename": "IdValue",
            "id": "Satellite",
            "value": "Album",
          },
          Object {
            "__typename": "IdValue",
            "id": "Elephant",
            "value": "Salt",
          },
        ],
        "preferredContactMethods": Array [
          Object {
            "__typename": "IdKeyValue",
            "id": "Rifle",
            "value": "Square",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Tongue Cup Spot Light",
            "value": "Nail",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Printer Treadmill",
            "value": "Fruit Butterfly Spiral",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Spoon",
            "value": "Fork Swimming Pool",
          },
        ],
        "sendAppeals": Array [
          Object {
            "__typename": "IdValue",
            "id": "Horse Wheelchair Onion",
            "value": "Maze Ice-cream",
          },
          Object {
            "__typename": "IdValue",
            "id": "Foot Bridge Chess Board",
            "value": "Gemstone",
          },
        ],
        "sendNewsletterOptions": Array [
          Object {
            "__typename": "IdValue",
            "id": "Sports-car",
            "value": "Rope",
          },
          Object {
            "__typename": "IdValue",
            "id": "Chisel Air Table",
            "value": "Bottle Record",
          },
        ],
        "statuses": Array [
          Object {
            "__typename": "IdValue",
            "id": "School Bank",
            "value": "Brain",
          },
          Object {
            "__typename": "IdValue",
            "id": "Carrot Slave Cave",
            "value": "Elephant Hieroglyph Tongue",
          },
          Object {
            "__typename": "IdValue",
            "id": "Nail Banana",
            "value": "Hat",
          },
          Object {
            "__typename": "IdValue",
            "id": "Coffee Bathroom",
            "value": "Room Tongue Staircase",
          },
        ],
        "times": Array [
          Object {
            "__typename": "Time",
            "key": 57,
            "value": "Passport Aeroplane",
          },
          Object {
            "__typename": "Time",
            "key": 5,
            "value": "Parachute",
          },
        ],
      }
    `);
  });
});
