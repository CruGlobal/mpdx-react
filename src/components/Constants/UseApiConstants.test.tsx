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
            "id": "Sandpaper Knife Fan",
            "value": "Drum Torpedo",
          },
          Object {
            "__typename": "IdValue",
            "id": "Tongue Sandwich",
            "value": "Web Meteor",
          },
          Object {
            "__typename": "IdValue",
            "id": "Perfume Ship Aeroplane",
            "value": "Airport Gemstone",
          },
          Object {
            "__typename": "IdValue",
            "id": "Cappuccino Army Coffee-shop",
            "value": "Ice Post-office",
          },
        ],
        "languages": Array [
          Object {
            "__typename": "IdValue",
            "id": "Kitchen",
            "value": "Family Sun Explosive",
          },
          Object {
            "__typename": "IdValue",
            "id": "Hose Cave",
            "value": "Girl",
          },
          Object {
            "__typename": "IdValue",
            "id": "Chair",
            "value": "Meteor",
          },
          Object {
            "__typename": "IdValue",
            "id": "Button Circle Chess Board",
            "value": "Pants Bowl Car",
          },
        ],
        "likelyToGiveOptions": Array [
          Object {
            "__typename": "IdValue",
            "id": "Microscope Carpet",
            "value": "Church Data Base Film",
          },
          Object {
            "__typename": "IdValue",
            "id": "Coffee-shop Rock",
            "value": "Sex Freeway",
          },
          Object {
            "__typename": "IdValue",
            "id": "Highway Bomb Circle",
            "value": "Water Child",
          },
          Object {
            "__typename": "IdValue",
            "id": "Bird",
            "value": "Hieroglyph Eraser Bridge",
          },
        ],
        "locations": Array [
          Object {
            "__typename": "IdValue",
            "id": "Mosquito",
          },
        ],
        "pledgeCurrencies": Array [
          Object {
            "__typename": "IdKeyValue",
            "id": "Maze Barbecue Sun",
            "value": "Teeth Chief",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Data Base Butterfly Computer",
            "value": "Chair Floodlight Toilet",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Tapestry Thermometer Spoon",
            "value": "Spice",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Ears",
            "value": "School School",
          },
        ],
        "pledgeFrequencies": Array [
          Object {
            "__typename": "IdKeyValue",
            "id": "Vampire Child",
            "key": "Square Bathtub Cycle",
            "value": "Church",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Spiral Chocolates Meat",
            "key": "Carrot",
            "value": "Pendulum Tennis racquet Sex",
          },
        ],
        "pledgesReceived": Array [
          Object {
            "__typename": "IdValue",
            "id": "God",
            "value": "Clown",
          },
          Object {
            "__typename": "IdValue",
            "id": "Spectrum Spiral Circus",
            "value": "Chief Mist",
          },
        ],
        "preferredContactMethods": Array [
          Object {
            "__typename": "IdKeyValue",
            "id": "Meat Guitar Umbrella",
            "value": "Cup",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Kitchen Prison Data Base",
            "value": "Adult Saddle Necklace",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Money $$$$ Aeroplane Cappuccino",
            "value": "Sex",
          },
          Object {
            "__typename": "IdKeyValue",
            "id": "Gemstone",
            "value": "Fruit Money $$$$ Table",
          },
        ],
        "sendAppeals": Array [
          Object {
            "__typename": "IdValue",
            "id": "Mosquito Circus Staircase",
            "value": "Pillow Square",
          },
          Object {
            "__typename": "IdValue",
            "id": "Sword",
            "value": "Solid Vulture",
          },
          Object {
            "__typename": "IdValue",
            "id": "Perfume",
            "value": "Meteor Gas Dress",
          },
          Object {
            "__typename": "IdValue",
            "id": "Printer",
            "value": "Sphere Mosquito",
          },
        ],
        "sendNewsletterOptions": Array [
          Object {
            "__typename": "IdValue",
            "id": "Album",
            "value": "Robot Airport",
          },
        ],
        "statuses": Array [
          Object {
            "__typename": "IdValue",
            "id": "Meat Window Torpedo",
            "value": "Bee Money $$$$ Surveyor",
          },
        ],
        "times": Array [
          Object {
            "__typename": "Time",
            "key": 41,
            "value": "Space Shuttle Woman Software",
          },
          Object {
            "__typename": "Time",
            "key": 29,
            "value": "Earth Floodlight",
          },
          Object {
            "__typename": "Time",
            "key": 49,
            "value": "Perfume",
          },
        ],
      }
    `);
  });
});
