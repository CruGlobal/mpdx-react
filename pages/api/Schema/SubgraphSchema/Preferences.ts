import CanUserExportDataTypeDefs from '../Settings/Preferences/CanUserExportData/canUserExportData.graphql';
import { canUserExportDataResolvers } from '../Settings/Preferences/CanUserExportData/resolvers';
import ExportDataTypeDefs from '../Settings/Preferences/ExportData/exportData.graphql';
import { exportDataResolvers } from '../Settings/Preferences/ExportData/resolvers';

export const preferencesSchema = [
  {
    typeDefs: CanUserExportDataTypeDefs,
    resolvers: canUserExportDataResolvers,
  },
  {
    typeDefs: ExportDataTypeDefs,
    resolvers: exportDataResolvers,
  },
];
