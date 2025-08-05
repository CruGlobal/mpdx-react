import React from 'react';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';

interface MPGAIncomeExpensesReportProps {
  accountListId: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

export const MPGAIncomeExpensesReport: React.FC<
  MPGAIncomeExpensesReportProps
> = ({ title, isNavListOpen, onNavListToggle }) => {
  return (
    <MultiPageHeader
      isNavListOpen={isNavListOpen}
      onNavListToggle={onNavListToggle}
      headerType={HeaderTypeEnum.Report}
      title={title}
    />
  );
};
