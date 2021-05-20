import { gql } from 'graphql-tag';

const ExportContactsTypeDefs = gql`
  extend type Mutation {
    exportContacts(input: ExportContactsInput!): String!
  }

  input ExportContactsInput {
    """
    Enum value to determine the file format of the exported contacts (Either csv, xlsx, or pdf)
    """
    format: ExportFormatEnum!
    """
    Boolean value to determine if export is going to be used for mailing purposes.
    """
    mailing: Boolean!
    labelType: ExportLabelTypeEnum
    sort: ExportSortEnum
    accountListId: ID!
  }

  enum ExportFormatEnum {
    csv
    xlsx
    pdf
  }

  enum ExportLabelTypeEnum {
    Avery5160
    Avery7160
  }

  enum ExportSortEnum {
    name
    zip
  }
`;

export default ExportContactsTypeDefs;
