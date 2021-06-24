import React, { ReactElement } from 'react';
import { Item } from './Item';

export default {
  title: 'Reports/ReportLayout/NavReportsList/Item',
};

const item = {
  id: 'salaryCurrency',
  title: 'Month Report',
  subTitle: 'Salary Currency',
};

export const Default = (): ReactElement => (
  <Item item={item} isSelected={false} />
);

export const Selected = (): ReactElement => (
  <Item item={item} isSelected={true} />
);
