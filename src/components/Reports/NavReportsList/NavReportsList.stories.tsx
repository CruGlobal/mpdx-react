import React, { ReactElement } from 'react';
import { NavReportsList } from './NavReportsList';

const selected = 'salaryCurrency';

export default {
  title: 'Reports/ReportLayout/NavReportsList',
};

export const Default = (): ReactElement => {
  return <NavReportsList selected={selected} />;
};
