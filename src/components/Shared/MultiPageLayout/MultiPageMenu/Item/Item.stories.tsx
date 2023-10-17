import React, { ReactElement } from 'react';
import { Item } from './Item';
import { NavTypeEnum } from '../MultiPageMenu';

export default {
  title: 'Reports/ReportLayout/NavReportsList/Item',
};

const item = {
  id: 'salaryCurrency',
  title: 'Month Report',
  subTitle: 'Salary Currency',
};

export const Default = (): ReactElement => (
  <Item
    item={item}
    selectedId={'notSalaryCurrency'}
    navType={NavTypeEnum.Reports}
  />
);

export const Selected = (): ReactElement => (
  <Item item={item} selectedId="salaryCurrency" navType={NavTypeEnum.Reports} />
);
