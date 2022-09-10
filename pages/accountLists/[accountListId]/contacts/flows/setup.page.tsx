import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Box from '@mui/material/Box';
import { v4 as uuidv4 } from 'uuid';
import { useSnackbar } from 'notistack';
import _ from 'lodash';
import { ContactFlowSetupDragLayer } from '../../../../../src/components/Contacts/ContactFlow/ContactFlowSetup/DragLayer/ContactFlowSetupDragLayer';
import { UnusedStatusesColumn } from '../../../../../src/components/Contacts/ContactFlow/ContactFlowSetup/Column/UnusedStatusesColumn';
import { ContactFilterStatusEnum } from '../../../../../graphql/types.generated';
import {
  GetUserOptionsDocument,
  GetUserOptionsQuery,
  useGetUserOptionsQuery,
} from '../../../../../src/components/Contacts/ContactFlow/GetUserOptions.generated';
import Loading from '../../../../../src/components/Loading';
import { ContactFlowSetupHeader } from '../../../../../src/components/Contacts/ContactFlow/ContactFlowSetup/Header/ContactFlowSetupHeader';
import { useAccountListId } from '../../../../../src/hooks/useAccountListId';
import {
  colorMap,
  ContactFlowOption,
  statusMap,
} from '../../../../../src/components/Contacts/ContactFlow/ContactFlow';
import { ContactFlowSetupColumn } from '../../../../../src/components/Contacts/ContactFlow/ContactFlowSetup/Column/ContactFlowSetupColumn';
import { useUpdateUserOptionsMutation } from '../../../../../src/components/Contacts/ContactFlow/ContactFlowSetup/UpdateUserOptions.generated';

const ContactFlowSetupPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();
  const { data: userOptions, loading } = useGetUserOptionsQuery({
    onCompleted: () => {
      setFlowOptions(
        JSON.parse(
          userOptions?.userOptions.find((option) => option.key === 'flows')
            ?.value || '[]',
        ),
      );
    },
  });
  const [updateUserOptions] = useUpdateUserOptionsMutation();
  const [flowOptions, setFlowOptions] = useState<
    {
      name: string;
      statuses: string[];
      color: string;
      id: string;
    }[]
  >([]);

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

  const addColumn = (): void => {
    updateOptions([
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
          MPDX | {t('Contact Flows')} | {t('Setup')}
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
                gridTemplateColumns={`repeat(${flowOptions.length + 1}, 1fr`}
                gridAutoFlow="column"
                style={{ overflowX: 'auto' }}
              >
                {flowOptions.map((column, index) => (
                  <Box
                    width={'100%'}
                    // If there are more than five columns give them a fixed width
                    // otherwise fit them equally into the screen
                    minWidth={flowOptions.length > 5 ? 360 : '100%'}
                    p={2}
                    key={index}
                  >
                    <ContactFlowSetupColumn
                      index={index}
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
                    />
                  </Box>
                ))}
                <Box
                  width={'100%'}
                  // If there are more than five columns give them a fixed width
                  // otherwise fit them equally into the screen
                  minWidth={flowOptions.length > 5 ? 360 : '100%'}
                  p={2}
                >
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
                </Box>
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

export default ContactFlowSetupPage;
