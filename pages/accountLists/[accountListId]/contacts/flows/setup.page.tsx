import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Box } from '@material-ui/core';
import { useSnackbar } from 'notistack';
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
import theme from '../../../../../src/theme';
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
  const {
    data: userOptions,
    loading: loadingUserOptions,
  } = useGetUserOptionsQuery({});
  const [updateUserOptions] = useUpdateUserOptionsMutation();

  const flowOptions: {
    name: string;
    statuses: string[];
    color: string;
  }[] = JSON.parse(
    userOptions?.userOptions.find((option) => option.key === 'flows')?.value ||
      '[]',
  );

  console.log(flowOptions);

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
    const temp = [
      ...flowOptions,
      {
        name: 'Untitled',
        statuses: [],
        color: 'color-text',
      },
    ];
    updateOptions(temp);
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

  const changeTitle = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ): void => {
    const temp = [...flowOptions];
    temp[index].name = event.target.value;
    updateOptions(temp);
  };

  return (
    <>
      <Head>
        <title>
          MPDX | {t('Flows')} | {t('Setup')}
        </title>
      </Head>
      {accountListId && !loadingUserOptions ? (
        <DndProvider backend={HTML5Backend}>
          <Box>
            <ContactFlowSetupHeader addColumn={addColumn} />
            {flowOptions && (
              <Box
                display="grid"
                minWidth="100%"
                gridTemplateColumns={`repeat(${flowOptions.length + 1}, ${
                  flowOptions.length > 5
                    ? '1fr'
                    : 'minmax(0, 1fr)); minmax(0, 1fr)'
                }`}
                gridAutoFlow="column"
                gridGap={theme.spacing(1)}
                style={{ overflowX: 'auto' }}
              >
                {flowOptions.map((column, index) => (
                  <Box
                    width={'100%'}
                    // If there are more than five columns give them a fixed width
                    // otherwise fit them equally into the screen
                    minWidth={flowOptions.length > 5 ? 360 : '100%'}
                    p={2}
                    key={column.name}
                  >
                    <ContactFlowSetupColumn
                      index={index}
                      accountListId={accountListId}
                      title={column.name}
                      color={colorMap[column.color]}
                      changeColor={changeColor}
                      changeTitle={changeTitle}
                      deleteColumn={deleteColumn}
                      statuses={column.statuses.map(
                        (status) =>
                          statusMap[status] as ContactFilterStatusEnum,
                      )}
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
                    statuses={unusedStatuses.map(
                      (status) => statusMap[status] as ContactFilterStatusEnum,
                    )}
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
