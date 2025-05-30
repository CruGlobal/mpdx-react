import Head from 'next/head';
import React, { useCallback, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { isEqual } from 'lodash';
import { useSnackbar } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { colorMap } from 'src/components/Contacts/ContactFlow/ContactFlow';
import { ContactFlowSetupColumn } from 'src/components/Contacts/ContactFlow/ContactFlowSetup/Column/ContactFlowSetupColumn';
import { UnusedStatusesColumn } from 'src/components/Contacts/ContactFlow/ContactFlowSetup/Column/UnusedStatusesColumn';
import { ContactFlowSetupDragLayer } from 'src/components/Contacts/ContactFlow/ContactFlowSetup/DragLayer/ContactFlowSetupDragLayer';
import { ContactFlowSetupHeader } from 'src/components/Contacts/ContactFlow/ContactFlowSetup/Header/ContactFlowSetupHeader';
import { getDefaultFlowOptions } from 'src/components/Contacts/ContactFlow/contactFlowDefaultOptions';
import {
  FlowOption,
  useFlowOptions,
} from 'src/components/Contacts/ContactFlow/useFlowOptions';
import Loading from 'src/components/Loading';
import { StatusEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useContactPartnershipStatuses } from 'src/hooks/useContactPartnershipStatuses';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import theme from 'src/theme';

const StickyBox = styled(Box)(() => ({
  '@media (min-width:900px)': {
    position: 'sticky',
    right: 0,
    background: '#ffffff',
  },
}));

const ContactFlowSetupPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { statusMap, getContactStatusesByPhase } =
    useContactPartnershipStatuses();
  const { getLocalizedPhase } = useLocalizedConstants();
  const { enqueueSnackbar } = useSnackbar();
  const [flowOptions, setFlowOptions] = useState<FlowOption[]>([]);
  const resetColumnsMessage = t(
    'Since all columns have been removed, resetting columns to their default values',
  );
  const [userOptions, updateOptions, { loading }] = useFlowOptions();

  useEffect(() => {
    if (!userOptions.length) {
      setFlowOptions(
        getDefaultFlowOptions(t, getContactStatusesByPhase, getLocalizedPhase),
      );
    } else {
      setFlowOptions(userOptions);
    }
  }, [userOptions]);

  const { appName } = useGetAppSettings();

  const allUsedStatuses = flowOptions
    ? flowOptions.flatMap((option) => option.statuses)
    : [];
  const unusedStatuses = Object.values(statusMap).filter(
    (status) => !allUsedStatuses.includes(status),
  );

  const addColumn = (): void => {
    updateOptions([
      ...flowOptions,
      {
        name: 'Untitled',
        id: crypto.randomUUID(),
        statuses: [],
        color: 'color-text',
      },
    ]);
  };

  const deleteColumn = (index: number): void => {
    const temp = [...flowOptions];
    temp.splice(index, 1);

    if (!temp.length) {
      enqueueSnackbar(resetColumnsMessage, {
        variant: 'warning',
      });
    }
    updateOptions(temp);
  };

  const changeColor = (index: number, color: string): void => {
    const temp = [...flowOptions];
    temp[index] = { ...temp[index], color };
    updateOptions(temp);
  };

  const moveStatus = useCallback(
    (
      originIndex: number,
      destinationIndex: number,
      draggedStatus: StatusEnum,
    ): void => {
      const temp = [...flowOptions];
      if (originIndex > -1) {
        temp[originIndex] = {
          ...temp[originIndex],
          statuses: temp[originIndex].statuses.filter(
            (status) => status !== draggedStatus,
          ),
        };
      }
      if (destinationIndex > -1) {
        temp[destinationIndex] = {
          ...temp[destinationIndex],
          statuses: [...temp[destinationIndex].statuses, draggedStatus],
        };
      }
      updateOptions(temp);
    },
    [flowOptions],
  );

  const changeTitle = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ): void => {
    updateOptions(
      flowOptions.map((option, currentIndex) =>
        currentIndex === index
          ? { ...option, name: event.target.value }
          : option,
      ),
    );
  };

  const [columnWidth, setColumnWidth] = useState(0);

  const moveColumns = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const draggedColumn = flowOptions[dragIndex];
      const temp = [...flowOptions];
      temp.splice(dragIndex, 1);
      temp.splice(hoverIndex, 0, draggedColumn);
      setFlowOptions(temp);
    },
    [flowOptions],
  );

  const updateColumns = () => {
    if (!isEqual(userOptions, flowOptions)) {
      updateOptions(flowOptions);
    }
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Contact Flows')} | ${t('Setup')}`}</title>
      </Head>
      {accountListId ? (
        <DndProvider backend={HTML5Backend}>
          {!loading && <ContactFlowSetupDragLayer />}
          <Box>
            <ContactFlowSetupHeader
              addColumn={addColumn}
              updateOptions={updateOptions}
              resetColumnsMessage={resetColumnsMessage}
            />
            {flowOptions && (
              <Box
                display="grid"
                minWidth="100%"
                gridTemplateColumns={`repeat(${
                  flowOptions.length + 1
                }, minmax(300px, 1fr)); minmax(300px, 1fr)`}
                gridAutoFlow="column"
                gap={theme.spacing(1)}
                overflow="auto"
                style={{ overflowX: 'auto' }}
                gridAutoColumns="300px"
              >
                {flowOptions.map((column, idx) => (
                  <Box
                    width={'100%'}
                    minWidth={300}
                    p={2}
                    key={`flow-column-${column.id ?? idx}`}
                  >
                    <ContactFlowSetupColumn
                      index={idx}
                      loading={loading}
                      accountListId={accountListId}
                      title={column.name}
                      color={colorMap[column.color]}
                      changeColor={changeColor}
                      changeTitle={changeTitle}
                      deleteColumn={deleteColumn}
                      moveStatus={moveStatus}
                      moveColumns={moveColumns}
                      updateColumns={updateColumns}
                      columnWidth={columnWidth}
                      setColumnWidth={setColumnWidth}
                      statuses={column.statuses}
                      flowOptions={flowOptions}
                    />
                  </Box>
                ))}
                <StickyBox width={'100%'} minWidth={250} p={2}>
                  <UnusedStatusesColumn
                    accountListId={accountListId}
                    columnWidth={columnWidth}
                    loading={loading}
                    moveStatus={moveStatus}
                    statuses={unusedStatuses}
                  />
                </StickyBox>
              </Box>
            )}
          </Box>
        </DndProvider>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default ContactFlowSetupPage;
