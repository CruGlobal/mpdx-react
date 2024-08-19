import { fetchAllData } from './deserializeJsonApi';

describe('deserializeJsonApi', () => {
  describe('fetchAllData', () => {
    let originalObject;
    let includes;

    beforeEach(() => {
      originalObject = {
        id: 'some-id',
        type: 'obj1',
        attributes: {
          prop1: 'prop1',
          prop2: ['prop2'],
          prop3: {
            nested: 'nested1',
          },
          override: false,
          updated_at: '2024-06-25T14:42:34Z',
          updated_in_db_at: '2024-06-25T14:42:34Z',
        },
        relationships: {
          rel1: {
            data: {
              id: 'rel-id-1',
              type: 'rel1',
            },
          },
          rel2: {
            data: [
              {
                id: 'rel-id-2',
                type: 'rel2',
              },
              {
                id: 'rel-id-3',
                type: 'rel2',
              },
            ],
          },
          rel3: {
            data: {
              id: 'not-included',
              type: 'notIncluded',
            },
          },
        },
      };

      includes = [
        {
          id: 'rel-id-1',
          type: 'rel1',
          attributes: {
            rel_prop_1: 'relProp1',
            relProp2: 'relProp2',
          },
        },
        {
          id: 'rel-id-2',
          type: 'rel2',
          attributes: {
            relProp3: 'relProp3',
            relProp4: 'relProp4',
          },
        },
        {
          id: 'rel-id-3',
          type: 'rel2',
          attributes: {
            relProp5: 'relProp5',
            relProp6: 'relProp6',
          },
        },
      ];
    });

    it('should turn snake case to camel case', () => {
      const fetched = fetchAllData(originalObject, includes);
      expect(fetched['updatedAt']).toEqual(
        originalObject.attributes.updated_at,
      );
    });

    it('should flatten the data', () => {
      const flattened = fetchAllData(originalObject, includes);

      expect(flattened).toEqual({
        id: 'some-id',
        prop1: 'prop1',
        prop2: ['prop2'],
        prop3: {
          nested: 'nested1',
        },
        override: false,
        rel1: {
          id: 'rel-id-1',
          relProp1: 'relProp1',
          relProp2: 'relProp2',
        },
        rel2: [
          {
            id: 'rel-id-2',
            relProp3: 'relProp3',
            relProp4: 'relProp4',
          },
          {
            id: 'rel-id-3',
            relProp5: 'relProp5',
            relProp6: 'relProp6',
          },
        ],
        rel3: {},
        updatedAt: '2024-06-25T14:42:34Z',
        updatedInDbAt: '2024-06-25T14:42:34Z',
      });
    });

    it('should handle nested relationships', () => {
      includes[1].relationships = {
        rel4: {
          data: {
            id: 'nested-relationship',
            type: 'nestedRelationship',
          },
        },
      };
      const flattened = fetchAllData(originalObject, includes);
      expect(flattened['rel4']).toBeUndefined();
      expect(flattened['rel2'][0]['rel4']).toEqual({});
    });

    it('should handle relationship with no attributes', () => {
      includes.push({
        id: 'rel-id-4',
        type: 'rel2',
      });
      originalObject.relationships.rel2.data.push({
        id: 'rel-id-4',
        type: 'rel2',
      });
      const flattened = fetchAllData(originalObject, includes);
      expect(flattened['rel2'][2]).toEqual('rel-id-4');
    });
  });
});
