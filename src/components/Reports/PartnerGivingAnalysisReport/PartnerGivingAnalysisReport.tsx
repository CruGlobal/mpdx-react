import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { GridSortModel } from '@mui/x-data-grid/models/gridSortModel';
import { useTranslation } from 'react-i18next';
import { Panel } from 'pages/accountLists/[accountListId]/reports/helpers';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';
import { ListHeader, PageEnum } from 'src/components/Shared/Header/ListHeader';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { useUrlFilters } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import {
  PartnerGivingAnalysisContact,
  PartnerGivingAnalysisFilterSetInput,
  PartnerGivingAnalysisSortEnum,
} from 'src/graphql/types.generated';
import { useGetPartnerGivingAnalysisIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import { useMassSelection } from 'src/hooks/useMassSelection';
import { Order } from '../Reports.type';
import {
  AscendingSortEnums,
  DescendingSortEnums,
  EnumMap,
} from './Helper/sortRecords';
import { usePartnerGivingAnalysisQuery } from './PartnerGivingAnalysis.generated';
import { PartnerGivingAnalysisTable as Table } from './Table/Table';

interface Props {
  accountListId: string;
  panelOpen: Panel | null;
  onNavListToggle: () => void;
  onFilterListToggle: () => void;
  title: string;
}

export type Contact = PartnerGivingAnalysisContact;

export const PartnerGivingAnalysisReport: React.FC<Props> = ({
  accountListId,
  panelOpen,
  onNavListToggle,
  onFilterListToggle,
  title,
}) => {
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<PartnerGivingAnalysisSortEnum>(
    PartnerGivingAnalysisSortEnum.NameAsc,
  );
  const { activeFilters, searchTerm } = useUrlFilters();
  const cursorsRef = useRef(new Map<number, string | null>([[0, null]]));

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: EnumMap[orderBy] ?? 'name',
      sort: order,
    },
  ]);

  const contactFilters: PartnerGivingAnalysisFilterSetInput = {
    ...activeFilters,
    ...(searchTerm && {
      nameLike: `%${searchTerm}%`,
    }),
  };

  const { data, previousData, loading } = usePartnerGivingAnalysisQuery({
    variables: {
      input: {
        accountListId,
        filters: contactFilters,
        sortBy: orderBy,
      },
      first: paginationModel.pageSize,
      after: cursorsRef.current.get(paginationModel.page) ?? null,
    },
  });

  const contacts = data?.partnerGivingAnalysis.nodes ?? [];

  const contactCount =
    (data ?? previousData)?.partnerGivingAnalysis?.totalCount ?? 0;
  const { data: allContacts, previousData: allContactsPrevious } =
    useGetPartnerGivingAnalysisIdsForMassSelectionQuery({
      variables: {
        input: {
          accountListId,
        },
      },
      skip: contactCount === 0,
      notifyOnNetworkStatusChange: true,
    });
  // When the next batch of contact ids is loading, use the previous batch of contact ids in the
  // meantime to avoid throwing out the selected contact ids.
  const allContactIds = useMemo(
    () =>
      (allContacts ?? allContactsPrevious)?.partnerGivingAnalysis?.nodes.map(
        (contact) => contact.id,
      ) ?? [],
    [allContacts, allContactsPrevious],
  );

  useEffect(() => {
    const end = data?.partnerGivingAnalysis.pageInfo.endCursor ?? null;
    const hasNextPage =
      data?.partnerGivingAnalysis.pageInfo.hasNextPage ?? false;
    if (end !== null && hasNextPage) {
      cursorsRef.current.set(paginationModel.page + 1, end);
    }
  }, [data, paginationModel.page]);

  const {
    ids,
    selectionType,
    toggleSelectAll,
    toggleSelectionById,
    isRowChecked,
  } = useMassSelection(allContactIds);

  const handlePageChange = (model: { page: number; pageSize: number }) => {
    if (model.pageSize !== paginationModel.pageSize) {
      cursorsRef.current = new Map([[0, null]]);
      setPaginationModel({ page: 0, pageSize: model.pageSize });
    } else {
      setPaginationModel(model);
    }
  };

  const handleSortChange = (model: GridSortModel) => {
    const property = model[0].field;
    const transformOrderBy = EnumMap[orderBy];
    const isAsc = transformOrderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';

    setOrder(newOrder);
    setOrderBy(
      newOrder === 'asc'
        ? AscendingSortEnums[property]
        : DescendingSortEnums[property],
    );
    setSortModel([{ field: property, sort: newOrder }]);
  };

  return (
    <Box>
      <MultiPageHeader
        isNavListOpen={panelOpen === Panel.Navigation}
        onNavListToggle={onNavListToggle}
        title={title}
        headerType={HeaderTypeEnum.Report}
      />
      <ListHeader
        page={PageEnum.Report}
        filterPanelOpen={panelOpen === Panel.Filters}
        toggleFilterPanel={onFilterListToggle}
        onCheckAllItems={toggleSelectAll}
        showShowingCount={false}
        totalItems={contactCount}
        headerCheckboxState={selectionType}
        selectedIds={ids}
      />
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress data-testid="LoadingPartnerGivingAnalysisReport" />
        </Box>
      ) : contacts.length ? (
        <Table
          data={contacts}
          totalCount={data?.partnerGivingAnalysis.totalCount ?? 0}
          onSelectOne={toggleSelectionById}
          isRowChecked={isRowChecked}
          paginationModel={paginationModel}
          handlePageChange={handlePageChange}
          sortModel={sortModel}
          handleSortChange={handleSortChange}
        />
      ) : (
        <EmptyReport
          title={t('You have {{contacts}} total contacts', {
            contacts: data?.partnerGivingAnalysis.totalCount ?? '?',
          })}
          subTitle={t(
            'Unfortunately none of them match your current search or filters.',
          )}
        />
      )}
    </Box>
  );
};

PartnerGivingAnalysisReport.displayName = 'PartnerGivingAnalysisReport';
