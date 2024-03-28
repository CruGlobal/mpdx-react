import { FieldPolicy, Reference } from '@apollo/client';
import { mergeDeep } from '@apollo/client/utilities';
import {
  TExistingRelay,
  TIncomingRelay,
  TRelayEdge,
  TRelayPageInfo,
} from '@apollo/client/utilities/policies/pagination';
import { __rest } from 'tslib';

// Adapted from https://github.com/apollographql/apollo-client/blob/f9f8bef1ce1e66c4f7cdc2f163db9f345f41791c/src/utilities/policies/pagination.ts, adding support for nodes

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KeyArgs = FieldPolicy<any>['keyArgs'];

declare type TExistingRelayWithNodes<TNode> = TExistingRelay<TNode> &
  Readonly<{
    nodes: TNode[];
  }>;
declare type TIncomingRelayWithNodes<TNode> = TIncomingRelay<TNode> & {
  nodes?: TNode[];
};

declare type RelayFieldPolicyWithNodes<TNode> = FieldPolicy<
  TExistingRelayWithNodes<TNode>,
  TIncomingRelayWithNodes<TNode>,
  TIncomingRelayWithNodes<TNode>
>;

export function relayStylePaginationWithNodes<TNode = Reference>(
  keyArgs: KeyArgs = false,
): RelayFieldPolicyWithNodes<TNode> {
  return {
    keyArgs,

    read(existing, { canRead, readField }) {
      if (!existing) return;

      const edges: TRelayEdge<TNode>[] = [];
      let firstEdgeCursor = '';
      let lastEdgeCursor = '';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      existing.edges.forEach((edge: any) => {
        // Edges themselves could be Reference objects, so it's important
        // to use readField to access the edge.edge.node property.
        if (canRead(readField('node', edge))) {
          edges.push(edge);
          if (edge.cursor) {
            firstEdgeCursor = firstEdgeCursor || edge.cursor || '';
            lastEdgeCursor = edge.cursor || lastEdgeCursor;
          }
        }
      });

      const { startCursor, endCursor } = existing.pageInfo || {};

      return {
        // Some implementations return additional Connection fields, such
        // as existing.totalCount. These fields are saved by the merge
        // function, so the read function should also preserve them.
        ...getExtras(existing),
        edges,
        pageInfo: {
          ...existing.pageInfo,
          // If existing.pageInfo.{start,end}Cursor are undefined or "", default
          // to firstEdgeCursor and/or lastEdgeCursor.
          startCursor: startCursor || firstEdgeCursor,
          endCursor: endCursor || lastEdgeCursor,
        },
      };
    },

    merge(
      existing = makeEmptyData(),
      incoming,
      { args, isReference, readField },
    ) {
      const incomingEdges = incoming.edges
        ? incoming.edges.map((edge) => {
            if (isReference((edge = { ...edge }))) {
              // In case edge is a Reference, we read out its cursor field and
              // store it as an extra property of the Reference object.
              edge.cursor = readField<string>('cursor', edge);
            }
            return edge;
          })
        : [];

      const incomingNodes = incoming.nodes ?? [];

      if (incoming.pageInfo) {
        const { pageInfo } = incoming;
        const { startCursor, endCursor } = pageInfo;
        const firstEdge = incomingEdges[0];
        const lastEdge = incomingEdges[incomingEdges.length - 1];
        // In case we did not request the cursor field for edges in this
        // query, we can still infer cursors from pageInfo.
        if (firstEdge && startCursor) {
          firstEdge.cursor = startCursor;
        }
        if (lastEdge && endCursor) {
          lastEdge.cursor = endCursor;
        }
        // Cursors can also come from edges, so we default
        // pageInfo.{start,end}Cursor to {first,last}Edge.cursor.
        const firstCursor = firstEdge && firstEdge.cursor;
        if (firstCursor && !startCursor) {
          incoming = mergeDeep(incoming, {
            pageInfo: {
              startCursor: firstCursor,
            },
          });
        }
        const lastCursor = lastEdge && lastEdge.cursor;
        if (lastCursor && !endCursor) {
          incoming = mergeDeep(incoming, {
            pageInfo: {
              endCursor: lastCursor,
            },
          });
        }
      }

      let prefix = existing.edges;
      let suffix: typeof prefix = [];
      let nodePrefix = existing.nodes;
      let nodeSuffix: typeof nodePrefix = [];

      if (args && args.after) {
        // This comparison does not need to use readField("cursor", edge),
        // because we stored the cursor field of any Reference edges as an
        // extra property of the Reference object.
        const index = prefix.findIndex((edge) => edge.cursor === args.after);
        if (index >= 0) {
          prefix = prefix.slice(0, index + 1);
          // suffix = []; // already true
        }
        if (args.after !== existing.pageInfo.endCursor) {
          nodePrefix = [];
        }
      } else if (args && args.before) {
        const index = prefix.findIndex((edge) => edge.cursor === args.before);
        suffix = index < 0 ? prefix : prefix.slice(index);
        prefix = [];
        if (args.before === existing.pageInfo.startCursor) {
          nodeSuffix = nodePrefix;
          nodePrefix = [];
        } else {
          nodePrefix = [];
        }
      } else if (incoming.edges || incoming.nodes) {
        // If we have neither args.after nor args.before, the incoming
        // edges cannot be spliced into the existing edges, so they must
        // replace the existing edges. See #6592 for a motivating example.
        prefix = [];
        nodePrefix = [];
      }

      const edges = [...prefix, ...incomingEdges, ...suffix];
      const nodes = [...nodePrefix, ...incomingNodes, ...nodeSuffix];

      const pageInfo: TRelayPageInfo = {
        // The ordering of these two ...spreads may be surprising, but it
        // makes sense because we want to combine PageInfo properties with a
        // preference for existing values, *unless* the existing values are
        // overridden by the logic below, which is permitted only when the
        // incoming page falls at the beginning or end of the data.
        ...incoming.pageInfo,
        ...existing.pageInfo,
      };

      if (incoming.pageInfo) {
        const {
          hasPreviousPage,
          hasNextPage,
          startCursor,
          endCursor,
          ...extras
        } = incoming.pageInfo;

        // If incoming.pageInfo had any extra non-standard properties,
        // assume they should take precedence over any existing properties
        // of the same name, regardless of where this page falls with
        // respect to the existing data.
        Object.assign(pageInfo, extras);

        // Keep existing.pageInfo.has{Previous,Next}Page unless the
        // placement of the incoming edges means incoming.hasPreviousPage
        // or incoming.hasNextPage should become the new values for those
        // properties in existing.pageInfo. Note that these updates are
        // only permitted when the beginning or end of the incoming page
        // coincides with the beginning or end of the existing data, as
        // determined using prefix.length and suffix.length.
        if (!prefix.length) {
          if (void 0 !== hasPreviousPage)
            pageInfo.hasPreviousPage = hasPreviousPage;
          if (void 0 !== startCursor) pageInfo.startCursor = startCursor;
        }
        if (!suffix.length) {
          if (void 0 !== hasNextPage) pageInfo.hasNextPage = hasNextPage;
          if (void 0 !== endCursor) pageInfo.endCursor = endCursor;
        }
      }

      return {
        ...getExtras(existing),
        ...getExtras(incoming),
        edges,
        nodes,
        pageInfo,
      };
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getExtras = (obj: Record<string, any>) => __rest(obj, notExtras);
const notExtras = ['edges', 'pageInfo'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeEmptyData(): TExistingRelayWithNodes<any> {
  return {
    edges: [],
    nodes: [],
    pageInfo: {
      hasPreviousPage: false,
      hasNextPage: true,
      startCursor: '',
      endCursor: '',
    },
  };
}
