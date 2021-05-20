import { gql } from 'graphql-tag';

const ContactFiltersTypeDefs = gql`
  extend type Query {
    contactFilters(accountListId: ID!): [ContactFilterGroup!]!
  }

  type ContactFilterGroup {
    id: ID!
    title: String!
    alwaysVisible: Boolean!
    filters: [ContactFilter!]!
  }

  type ContactFilter {
    id: ID!
    name: String!
    type: String!
    defaultSelection: [String]!
    featured: Boolean!
    multiple: Boolean!
    options: [ContactFilterOption!]!
    parent: String
    title: String!
  }

  type ContactFilterOption {
    id: String
    name: String!
    placeholder: String
  }
`;

export default ContactFiltersTypeDefs;
