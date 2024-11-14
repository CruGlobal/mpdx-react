import { useMemo } from 'react';
import { TablePaginationProps } from '@mui/material';
import { GridLocaleText } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useLocale } from './useLocale';

export const useDataGridLocaleText = (): GridLocaleText => {
  const { t } = useTranslation();
  const locale = useLocale();
  const tablePaginationLocaleText = useTablePaginationLocaleText();

  return useMemo(
    () => ({
      // Root
      noRowsLabel: t('No rows'),

      noResultsOverlayLabel: t('No results found.'),
      errorOverlayDefaultLabel: t('An error occurred.'),

      // Density selector toolbar button text
      toolbarDensity: t('Density'),

      toolbarDensityLabel: t('Density'),
      toolbarDensityCompact: t('Compact'),
      toolbarDensityStandard: t('Standard'),
      toolbarDensityComfortable: t('Comfortable'),

      // Columns selector toolbar button text
      toolbarColumns: t('Columns'),

      toolbarColumnsLabel: t('Select columns'),

      // Filters toolbar button text
      toolbarFilters: t('Filters'),

      toolbarFiltersLabel: t('Show filters'),
      toolbarFiltersTooltipHide: t('Hide filters'),
      toolbarFiltersTooltipShow: t('Show filters'),

      toolbarFiltersTooltipActive: (count) =>
        count !== 1
          ? t('{{filters}} active filters', { filters: count })
          : t('{{filters}} active filter', { filters: count }),

      // Quick filter toolbar field
      toolbarQuickFilterPlaceholder: t('Search…'),

      toolbarQuickFilterLabel: t('Search'),
      toolbarQuickFilterDeleteIconLabel: t('Clear'),

      // Export selector toolbar button text
      toolbarExport: t('Export'),

      toolbarExportLabel: t('Export'),
      toolbarExportCSV: t('Download as CSV'),
      toolbarExportPrint: t('Print'),
      toolbarExportExcel: t('Download as Excel'),

      // Columns panel text
      columnsPanelTextFieldLabel: t('Find column'),

      columnsPanelTextFieldPlaceholder: t('Column title'),
      columnsPanelDragIconLabel: t('Reorder column'),
      columnsPanelShowAllButton: t('Show all'),
      columnsPanelHideAllButton: t('Hide all'),

      // Filter panel text
      filterPanelAddFilter: t('Add filter'),

      filterPanelDeleteIconLabel: t('Delete'),
      filterPanelLinkOperator: t('Logic operator'),
      filterPanelOperators: t('Operator'),
      filterPanelOperatorAnd: t('And'),
      filterPanelOperatorOr: t('Or'),
      filterPanelColumns: t('Columns'),
      filterPanelInputLabel: t('Value'),
      filterPanelInputPlaceholder: t('Filter value'),

      // Filter operators text
      filterOperatorContains: t('contains'),

      filterOperatorEquals: t('equals'),
      filterOperatorStartsWith: t('starts with'),
      filterOperatorEndsWith: t('ends with'),
      filterOperatorIs: t('is'),
      filterOperatorNot: t('is not'),
      filterOperatorAfter: t('is after'),
      filterOperatorOnOrAfter: t('is on or after'),
      filterOperatorBefore: t('is before'),
      filterOperatorOnOrBefore: t('is on or before'),
      filterOperatorIsEmpty: t('is empty'),
      filterOperatorIsNotEmpty: t('is not empty'),
      filterOperatorIsAnyOf: t('is any of'),

      // Filter values text
      filterValueAny: t('any'),

      filterValueTrue: t('true'),
      filterValueFalse: t('false'),

      // Column menu text
      columnMenuLabel: t('Menu'),

      columnMenuShowColumns: t('Show columns'),
      columnMenuFilter: t('Filter'),
      columnMenuHideColumn: t('Hide'),
      columnMenuUnsort: t('Unsort'),
      columnMenuSortAsc: t('Sort by ASC'),
      columnMenuSortDesc: t('Sort by DESC'),

      // Column header text
      columnHeaderFiltersTooltipActive: (count) =>
        count !== 1
          ? t('{{filters}} active filters', { filters: count })
          : t('1 active filter'),

      columnHeaderFiltersLabel: t('Show filters'),
      columnHeaderSortIconLabel: t('Sort'),

      // Rows selected footer text
      footerRowSelected: (count) =>
        count !== 1
          ? t('{{rows}} rows selected', {
              rows: count.toLocaleString(locale),
            })
          : t('{{rows}} row selected', {
              rows: count.toLocaleString(locale),
            }),

      // Total row amount footer text
      footerTotalRows: t('Total Rows:'),

      // Total visible row amount footer text
      footerTotalVisibleRows: (visibleCount, totalCount) =>
        t('{{visible}} of {{total}}', {
          visible: visibleCount.toLocaleString(locale),
          total: totalCount.toLocaleString(locale),
        }),

      // Checkbox selection text
      checkboxSelectionHeaderName: t('Checkbox selection'),

      checkboxSelectionSelectAllRows: t('Select all rows'),
      checkboxSelectionUnselectAllRows: t('Unselect all rows'),
      checkboxSelectionSelectRow: t('Select row'),
      checkboxSelectionUnselectRow: t('Unselect row'),

      // Boolean cell text
      booleanCellTrueLabel: t('yes'),

      booleanCellFalseLabel: t('no'),

      // Actions cell more text
      actionsCellMore: t('more'),

      // Column pinning text
      pinToLeft: t('Pin to left'),

      pinToRight: t('Pin to right'),
      unpin: t('Unpin'),

      // Tree Data
      treeDataGroupingHeaderName: t('Group'),

      treeDataExpand: t('see children'),
      treeDataCollapse: t('hide children'),

      // Grouping columns
      groupingColumnHeaderName: t('Group'),

      groupColumn: (name) => t('Group by {{name}}', name),
      unGroupColumn: (name) => t('Stop grouping by {{name}}', name),

      // Master/detail
      detailPanelToggle: t('Detail panel toggle'),

      expandDetailPanel: t('Expand'),
      collapseDetailPanel: t('Collapse'),

      // Used core components translation keys
      MuiTablePagination: tablePaginationLocaleText,

      // Row reordering text
      rowReorderingHeaderName: t('Row reordering'),

      // Aggregation
      aggregationMenuItemHeader: t('Aggregation'),

      aggregationFunctionLabelSum: t('sum'),
      aggregationFunctionLabelAvg: t('avg'),
      aggregationFunctionLabelMin: t('min'),
      aggregationFunctionLabelMax: t('max'),
      aggregationFunctionLabelSize: t('size'),
    }),
    [t, locale],
  );
};

export const useTablePaginationLocaleText =
  (): Partial<TablePaginationProps> => {
    const { t } = useTranslation();

    const localeText = useMemo(
      (): Partial<TablePaginationProps> => ({
        getItemAriaLabel: (type) => {
          switch (type) {
            case 'first':
              return t('first');
            case 'last':
              return t('last');
            case 'next':
              return t('next');
            case 'previous':
              return t('previous');
          }
        },
        labelRowsPerPage: t('Rows per page:'),
        labelDisplayedRows: ({ from, to, count }) =>
          t('{{from}}-{{to}} of {{total}}', { from, to, total: count }),
      }),
      [t],
    );

    return localeText;
  };
