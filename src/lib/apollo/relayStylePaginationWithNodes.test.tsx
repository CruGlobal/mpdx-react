import { InMemoryCache, gql } from '@apollo/client';
import { relayStylePaginationWithNodes } from './relayStylePaginationWithNodes';

const QUERY = gql`
  query Items {
    items {
      nodes {
        id
        name
      }
      edges {
        node {
          id
          name
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const makeCache = () =>
  new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          items: relayStylePaginationWithNodes(),
        },
      },
    },
  });

const writeItems = (cache: InMemoryCache) =>
  cache.writeQuery({
    query: QUERY,
    data: {
      items: {
        __typename: 'ItemConnection',
        nodes: [
          { __typename: 'Item', id: '1', name: 'one' },
          { __typename: 'Item', id: '2', name: 'two' },
        ],
        edges: [
          {
            __typename: 'ItemEdge',
            cursor: 'c1',
            node: { __typename: 'Item', id: '1', name: 'one' },
          },
          {
            __typename: 'ItemEdge',
            cursor: 'c2',
            node: { __typename: 'Item', id: '2', name: 'two' },
          },
        ],
        pageInfo: {
          __typename: 'PageInfo',
          hasNextPage: false,
          endCursor: 'c2',
        },
      },
    },
  });

describe('relayStylePaginationWithNodes', () => {
  it('returns all nodes and edges before eviction', () => {
    const cache = makeCache();
    writeItems(cache);

    const result = cache.readQuery<{
      items: { nodes: { id: string }[]; edges: { node: { id: string } }[] };
    }>({ query: QUERY });

    expect(result?.items.nodes.map((node) => node.id)).toEqual(['1', '2']);
    expect(result?.items.edges.map((edge) => edge.node.id)).toEqual(['1', '2']);
  });

  it('filters evicted items out of both nodes and edges', () => {
    const cache = makeCache();
    writeItems(cache);

    cache.evict({ id: 'Item:1' });
    cache.gc();

    const result = cache.readQuery<{
      items: { nodes: { id: string }[]; edges: { node: { id: string } }[] };
    }>({ query: QUERY });

    // The remaining item is read cleanly with no dangling reference error.
    expect(result?.items.nodes.map((node) => node.id)).toEqual(['2']);
    expect(result?.items.edges.map((edge) => edge.node.id)).toEqual(['2']);
  });
});
