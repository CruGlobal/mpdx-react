import Head from 'next/head';
import React, { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import _ from 'lodash';
import { useSnackbar } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import { ContactFilterStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import {
  ContactFlowOption,
  colorMap,
  statusMap,
} from '../../../../../src/components/Contacts/ContactFlow/ContactFlow';
import { ContactFlowSetupColumn } from '../../../../../src/components/Contacts/ContactFlow/ContactFlowSetup/Column/ContactFlowSetupColumn';
import { UnusedStatusesColumn } from '../../../../../src/components/Contacts/ContactFlow/ContactFlowSetup/Column/UnusedStatusesColumn';
import { ContactFlowSetupDragLayer } from '../../../../../src/components/Contacts/ContactFlow/ContactFlowSetup/DragLayer/ContactFlowSetupDragLayer';
import { ContactFlowSetupHeader } from '../../../../../src/components/Contacts/ContactFlow/ContactFlowSetup/Header/ContactFlowSetupHeader';
import { useUpdateUserOptionsMutation } from '../../../../../src/components/Contacts/ContactFlow/ContactFlowSetup/UpdateUserOptions.generated';
import {
  GetUserOptionsDocument,
  GetUserOptionsQuery,
  useGetUserOptionsQuery,
} from '../../../../../src/components/Contacts/ContactFlow/GetUserOptions.generated';
import Loading from '../../../../../src/components/Loading';
import { useAccountListId } from '../../../../../src/hooks/useAccountListId';
import useGetAppSettings from '../../../../../src/hooks/useGetAppSettings';

const StickyBox = styled(Box)(() => ({
  ['@media (min-width:900px)']: {
    position: 'sticky',
    right: 0,
    background: '#ffffff',
  },
}));

const ContactFlowSetupPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();
  const [flowOptions, setFlowOptions] = useState<
    {
      name: string;
      statuses: string[];
      color: string;
      id: string;
    }[]
  >([]);
  const { data: userOptions, loading } = useGetUserOptionsQuery();

  useEffect(() => {
    const newOptions = JSON.parse(
      userOptions?.userOptions.find((option) => option.key === 'flows')
        ?.value || '[]',
    );
    setFlowOptions(newOptions);
  }, [userOptions]);

  const [updateUserOptions] = useUpdateUserOptionsMutation();
  const { appName } = useGetAppSettings();

  const allUsedStatuses = flowOptions
    ? flowOptions.flatMap((option) => option.statuses)
    : [];
  const unusedStatuses = Object.keys(statusMap).filter(
    (status) => !allUsedStatuses.includes(status),
  );

  const updateOptions = async (options: ContactFlowOption[]): Promise<void> => {
    const stringified = JSON.stringify(options);
    await updateUserOptions({
      variables: {
        key: 'flows',
        value: stringified,
      },
      update: (cache, { data: updatedUserOption }) => {
        const query = {
          query: GetUserOptionsDocument,
        };
        const dataFromCache = cache.readQuery<GetUserOptionsQuery>(query);

        if (dataFromCache) {
          const filteredOld = dataFromCache.userOptions.filter(
            (option) => option.key !== 'flows',
          );
          const userOptions = [
            ...filteredOld,
            {
              __typename: 'Option',
              id: updatedUserOption?.createOrUpdateUserOption?.option.id,
              key: 'flows',
              value: stringified,
            },
          ];
          const data = {
            userOptions,
          };
          cache.writeQuery({ ...query, data });
        }
        enqueueSnackbar(t('User options updated!'), {
          variant: 'success',
        });
      },
    });
  };

  const addColumn = (): Promise<void> => {
    return updateOptions([
      ...flowOptions,
      {
        name: 'Untitled',
        id: uuidv4(),
        statuses: [],
        color: 'color-text',
      },
    ]);
  };

  const deleteColumn = (index: number): void => {
    const temp = [...flowOptions];
    temp.splice(index, 1);
    updateOptions(temp);
  };

  const changeColor = (index: number, color: string): void => {
    const temp = [...flowOptions];
    temp[index].color = color;
    updateOptions(temp);
  };

  const moveStatus = (
    originIndex: number,
    destinationIndex: number,
    draggedStatus: string,
  ): void => {
    const temp = [...flowOptions];
    if (originIndex > -1) {
      temp[originIndex].statuses = temp[originIndex].statuses.filter(
        (status) => status !== draggedStatus,
      );
    }
    if (destinationIndex > -1) {
      temp[destinationIndex].statuses.push(draggedStatus);
    }
    updateOptions(temp);
    setFlowOptions(temp);
  };

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
    const originalOptions = userOptions?.userOptions.find(
      (option) => option.key === 'flows',
    )?.value;
    if (!_.isEqual(originalOptions, flowOptions)) {
      updateOptions(flowOptions);
    }
  };

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Contact Flows')} | {t('Setup')}
        </title>
      </Head>
      {accountListId ? (
        <DndProvider backend={HTML5Backend}>
          {!loading && <ContactFlowSetupDragLayer />}
          <Box>
            <ContactFlowSetupHeader addColumn={addColumn} />
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
                      statuses={column.statuses.map((status) => ({
                        id: statusMap[status] as ContactFilterStatusEnum,
                        value: status,
                      }))}
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
                    statuses={unusedStatuses.map((status) => ({
                      id: statusMap[status] as ContactFilterStatusEnum,
                      value: status,
                    }))}
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

export const getServerSideProps = loadSession;

export default ContactFlowSetupPage;
