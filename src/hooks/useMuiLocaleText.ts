import { useMemo } from 'react';
import { TablePaginationProps } from '@mui/material';
import { GridLocaleText } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useLocale } from './useLocale';

export const useDataGridLocaleText = (): GridLocaleText => {
  const { t } = useTranslation();
  const locale = useLocale();

  // Labels are copied from https://github.com/mui/mui-x/blob/v8.9.2/packages/x-data-grid/src/constants/localeTextConstants.ts
  return useMemo(
    () => ({
      // Root
      noRowsLabel: t('No rows'),
      noResultsOverlayLabel: t('No results found.'),
      noColumnsOverlayLabel: t('No columns'),
      noColumnsOverlayManageColumns: t('Manage columns'),
      emptyPivotOverlayLabel: t(
        'Add fields to rows, columns, and values to create a pivot table',
      ),

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

      // Toolbar pivot button
      toolbarPivot: t('Pivot'),

      // Toolbar AI Assistant button
      toolbarAssistant: t('AI Assistant'),

      // Columns management text
      columnsManagementSearchTitle: t('Search'),
      columnsManagementNoColumns: t('No columns'),
      columnsManagementShowHideAllText: t('Show/Hide All'),
      columnsManagementReset: t('Reset'),
      columnsManagementDeleteIconLabel: t('Clear'),

      // Filter panel text
      filterPanelAddFilter: t('Add filter'),
      filterPanelRemoveAll: t('Remove all'),
      filterPanelDeleteIconLabel: t('Delete'),
      filterPanelLogicOperator: t('Logic operator'),
      filterPanelOperator: t('Operator'),
      filterPanelOperatorAnd: t('And'),
      filterPanelOperatorOr: t('Or'),
      filterPanelColumns: t('Columns'),
      filterPanelInputLabel: t('Value'),
      filterPanelInputPlaceholder: t('Filter value'),

      // Filter operators text
      filterOperatorContains: t('contains'),
      filterOperatorDoesNotContain: t('does not contain'),
      filterOperatorEquals: t('equals'),
      filterOperatorDoesNotEqual: t('does not equal'),
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
      'filterOperator=': '=',
      'filterOperator!=': '!=',
      'filterOperator>': '>',
      'filterOperator>=': '>=',
      'filterOperator<': '<',
      'filterOperator<=': '<=',

      // Header filter operators text
      headerFilterOperatorContains: t('Contains'),
      headerFilterOperatorDoesNotContain: t('Does not contain'),
      headerFilterOperatorEquals: t('Equals'),
      headerFilterOperatorDoesNotEqual: t('Does not equal'),
      headerFilterOperatorStartsWith: t('Starts with'),
      headerFilterOperatorEndsWith: t('Ends with'),
      headerFilterOperatorIs: t('Is'),
      headerFilterOperatorNot: t('Is not'),
      headerFilterOperatorAfter: t('Is after'),
      headerFilterOperatorOnOrAfter: t('Is on or after'),
      headerFilterOperatorBefore: t('Is before'),
      headerFilterOperatorOnOrBefore: t('Is on or before'),
      headerFilterOperatorIsEmpty: t('Is empty'),
      headerFilterOperatorIsNotEmpty: t('Is not empty'),
      headerFilterOperatorIsAnyOf: t('Is any of'),
      'headerFilterOperator=': t('Equals'),
      'headerFilterOperator!=': t('Not equals'),
      'headerFilterOperator>': t('Greater than'),
      'headerFilterOperator>=': t('Greater than or equal to'),
      'headerFilterOperator<': t('Less than'),
      'headerFilterOperator<=': t('Less than or equal to'),
      headerFilterClear: t('Clear filter'),

      // Filter values text
      filterValueAny: t('any'),
      filterValueTrue: t('true'),
      filterValueFalse: t('false'),

      // Column menu text
      columnMenuLabel: t('Menu'),
      columnMenuAriaLabel: (columnName: string) =>
        t('{{columnName}} column menu', { columnName }),
      columnMenuShowColumns: t('Show columns'),
      columnMenuManageColumns: t('Manage columns'),
      columnMenuFilter: t('Filter'),
      columnMenuHideColumn: t('Hide column'),
      columnMenuUnsort: t('Unsort'),
      columnMenuSortAsc: t('Sort by ASC'),
      columnMenuSortDesc: t('Sort by DESC'),
      columnMenuManagePivot: t('Manage pivot'),

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
      groupColumn: (name) => t('Group by {{name}}', { name }),
      unGroupColumn: (name) => t('Stop grouping by {{name}}', { name }),

      // Master/detail
      detailPanelToggle: t('Detail panel toggle'),
      expandDetailPanel: t('Expand'),
      collapseDetailPanel: t('Collapse'),

      // Pagination
      paginationRowsPerPage: t('Rows per page:'),
      paginationDisplayedRows: ({ from, to, count, estimated }) => {
        if (!estimated) {
          return `${from}–${to} ${t('of')} ${
            count !== -1 ? count : t('more than {{to}}', { to })
          }`;
        }
        const estimatedLabel =
          estimated && estimated > to
            ? t('around {{estimated}}', { estimated })
            : t('more than {{to}}', { to });
        return `${from}–${to} ${t('of')} ${
          count !== -1 ? count : estimatedLabel
        }`;
      },
      paginationItemAriaLabel: (type) => {
        if (type === 'first') {
          return t('Go to first page');
        }
        if (type === 'last') {
          return t('Go to last page');
        }
        if (type === 'next') {
          return t('Go to next page');
        }
        // if (type === 'previous') {
        return t('Go to previous page');
      },

      // Row reordering text
      rowReorderingHeaderName: t('Row reordering'),

      // Aggregation
      aggregationMenuItemHeader: t('Aggregation'),
      aggregationFunctionLabelSum: t('sum'),
      aggregationFunctionLabelAvg: t('avg'),
      aggregationFunctionLabelMin: t('min'),
      aggregationFunctionLabelMax: t('max'),
      aggregationFunctionLabelSize: t('size'),

      // Pivot panel
      pivotToggleLabel: t('Pivot'),
      pivotRows: t('Rows'),
      pivotColumns: t('Columns'),
      pivotValues: t('Values'),
      pivotCloseButton: t('Close pivot settings'),
      pivotSearchButton: t('Search fields'),
      pivotSearchControlPlaceholder: t('Search fields'),
      pivotSearchControlLabel: t('Search fields'),
      pivotSearchControlClear: t('Clear search'),
      pivotNoFields: t('No fields'),
      pivotMenuMoveUp: t('Move up'),
      pivotMenuMoveDown: t('Move down'),
      pivotMenuMoveToTop: t('Move to top'),
      pivotMenuMoveToBottom: t('Move to bottom'),
      pivotMenuRows: t('Rows'),
      pivotMenuColumns: t('Columns'),
      pivotMenuValues: t('Values'),
      pivotMenuOptions: t('Field options'),
      pivotMenuAddToRows: t('Add to Rows'),
      pivotMenuAddToColumns: t('Add to Columns'),
      pivotMenuAddToValues: t('Add to Values'),
      pivotMenuRemove: t('Remove'),
      pivotDragToRows: t('Drag here to create rows'),
      pivotDragToColumns: t('Drag here to create columns'),
      pivotDragToValues: t('Drag here to create values'),
      pivotYearColumnHeaderName: t('(Year)'),
      pivotQuarterColumnHeaderName: t('(Quarter)'),

      // AI Assistant panel
      aiAssistantPanelTitle: t('AI Assistant'),
      aiAssistantPanelClose: t('Close AI Assistant'),
      aiAssistantPanelNewConversation: t('New conversation'),
      aiAssistantPanelConversationHistory: t('Conversation history'),
      aiAssistantPanelEmptyConversation: t('No prompt history'),
      aiAssistantSuggestions: t('Suggestions'),

      // Prompt field
      promptFieldLabel: t('Prompt'),
      promptFieldPlaceholder: t('Type a prompt…'),
      promptFieldPlaceholderWithRecording: t('Type or record a prompt…'),
      promptFieldPlaceholderListening: t('Listening for prompt…'),
      promptFieldSpeechRecognitionNotSupported: t(
        'Speech recognition is not supported in this browser',
      ),
      promptFieldSend: t('Send'),
      promptFieldRecord: t('Record'),
      promptFieldStopRecording: t('Stop recording'),

      // Prompt
      promptRerun: t('Run again'),
      promptProcessing: t('Processing…'),
      promptAppliedChanges: t('Applied changes'),

      // Prompt changes
      promptChangeGroupDescription: (column: string) =>
        t('Group by {{column}}', { column }),
      promptChangeAggregationLabel: (column: string, aggregation: string) =>
        `${column} (${aggregation})`,
      promptChangeAggregationDescription: (
        column: string,
        aggregation: string,
      ) => t('Aggregate {{column}} ({{aggregation}})', { column, aggregation }),
      promptChangeFilterLabel: (
        column: string,
        operator: string,
        value: string,
      ) => {
        if (operator === 'is any of') {
          return t('{{column}} is any of: {{value}}', { column, value });
        }
        return t('{{column}} {{operator}} {{value}}', {
          column,
          operator,
          value,
        });
      },
      promptChangeFilterDescription: (
        column: string,
        operator: string,
        value: string,
      ) => {
        if (operator === 'is any of') {
          return t('Filter where {{column}} is any of: {{value}}', {
            column,
            value,
          });
        }
        return t('Filter where {{column}} {{operator}} {{value}}', {
          column,
          operator,
          value,
        });
      },
      promptChangeSortDescription: (column: string, direction: string) =>
        t('Sort by {{column}} ({{direction}})', { column, direction }),
      promptChangePivotEnableLabel: t('Pivot'),
      promptChangePivotEnableDescription: t('Enable pivot'),
      promptChangePivotColumnsLabel: (count: number) =>
        t('Columns ({{count}})', { count }),
      promptChangePivotColumnsDescription: (
        column: string,
        direction: string,
      ) => `${column}${direction ? ` (${direction})` : ''}`,
      promptChangePivotRowsLabel: (count: number) =>
        t('Rows ({{count}})', { count }),
      promptChangePivotValuesLabel: (count: number) =>
        t('Values ({{count}})', { count }),
      promptChangePivotValuesDescription: (
        column: string,
        aggregation: string,
      ) => `${column} (${aggregation})`,
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
