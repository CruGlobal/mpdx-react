import React, { ReactElement } from 'react';
import { MultiPageMenu, NavTypeEnum } from './MultiPageMenu';

const selected = 'salaryCurrency';

export default {
  title: 'Reports/ReportLayout/NavReportsList',
};

export const Default = (): ReactElement => {
  return (
    <MultiPageMenu
      selectedId={selected}
      isOpen={true}
      onClose={() => {}}
      designationAccounts={[]}
      setDesignationAccounts={() => {}}
      navType={NavTypeEnum.Reports}
    />
  );
};
