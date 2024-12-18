import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { Trans, useTranslation } from 'react-i18next';
import { ItemProps } from 'react-virtuoso';
import {
  InfiniteList,
  ItemWithBorders,
} from 'src/components/InfiniteList/InfiniteList';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import {
  PersonInvalidEmailFragment,
  useGetInvalidEmailAddressesQuery,
  useUpdateEmailAddressesMutation,
  useUpdatePeopleMutation,
} from 'src/components/Tool/FixEmailAddresses/FixEmailAddresses.generated';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import {
  PersonEmailAddressInput,
  PersonUpdateInput,
} from 'src/graphql/types.generated';
import {
  manualSourceValue,
  sourceToStr,
  sourcesMatch,
} from 'src/utils/sourceHelper';
import theme from '../../../theme';
import { ConfirmButtonIcon } from '../ConfirmButtonIcon';
import NoData from '../NoData';
import { ToolsGridContainer } from '../styledComponents';
import { FixEmailAddressPerson } from './FixEmailAddressPerson/FixEmailAddressPerson';

const Container = styled(Box)(() => ({
  padding: theme.spacing(3),
  overflow: 'auto',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const SourceSelect = styled(Select)(() => ({
  minWidth: theme.spacing(20),
  width: '10%',
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
  [theme.breakpoints.down('xs')]: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

const ConfirmButton = styled(Button)(({ theme }) => ({
  color: 'white',
  [theme.breakpoints.down('xs')]: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
}));

const DefaultSourceWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  flexWrap: 'wrap',
  marginTop: theme.spacing(1),
  [theme.breakpoints.down('xs')]: {
    flexDirection: 'column',
    alignItems: 'start',
  },
}));

const ItemOverride: React.ComponentType<ItemProps> = (props) => (
  <ItemWithBorders disableGutters disableHover={true} {...props} />
);

export interface EmailAddressData {
  id: string;
  primary: boolean;
  updatedAt: string;
  source: string;
  email: string;
  destroy?: boolean;
}

export interface PersonEmailAddresses {
  emailAddresses: EmailAddressData[];
}

//TODO: Try to make bulk confirm logic more similar across tools, perhaps we can factor out a common function
export const determineBulkDataToSend = (
  dataState: {
    [key: string]: PersonEmailAddresses;
  },
  defaultSource: string,
): PersonUpdateInput[] => {
  const dataToSend = [] as PersonUpdateInput[];

  Object.entries(dataState).forEach((value) => {
    const primaryEmailAddress = value[1].emailAddresses.find((email) =>
      sourcesMatch(defaultSource, email.source),
    );
    if (primaryEmailAddress) {
      dataToSend.push({
        id: value[0],
        emailAddresses: value[1].emailAddresses.map(
          (emailAddress) =>
            ({
              email: emailAddress.email,
              id: emailAddress.id,
              primary: emailAddress.id === primaryEmailAddress.id,
              validValues: true,
            } as PersonEmailAddressInput),
        ),
      });
    }
  });
  return dataToSend;
};

interface FixEmailAddressesProps {
  accountListId: string;
}

export const FixEmailAddresses: React.FC<FixEmailAddressesProps> = ({
  accountListId,
}) => {
  const [defaultSource, setDefaultSource] = useState(manualSourceValue);
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { data, loading, fetchMore } = useGetInvalidEmailAddressesQuery({
    variables: { accountListId },
  });
  const [updateEmailAddressesMutation] = useUpdateEmailAddressesMutation();
  const [updatePeople] = useUpdatePeopleMutation();

  const [dataState, setDataState] = useState<{
    [key: string]: PersonEmailAddresses;
  }>({});

  const [sourceOptions, setSourceOptions] = useState<string[]>([
    manualSourceValue,
  ]);

  // Create a mutable copy of the query data and store in the state
  useEffect(() => {
    const existingSources = new Set<string>();
    existingSources.add(manualSourceValue);

    const newDataState = data
      ? data.people.nodes?.reduce<{ [key: string]: PersonEmailAddresses }>(
          (map, person) => ({
            ...map,
            [person.id]: {
              emailAddresses: person.emailAddresses.nodes.map(
                (emailAddress) => {
                  existingSources.add(emailAddress.source);
                  return { ...emailAddress };
                },
              ),
            },
          }),
          {},
        )
      : {};
    setDataState(newDataState);
    setSourceOptions([...existingSources]);
  }, [loading, data]);

  // Update the state with the textfield's value
  const handleChange = (
    personId: string,
    numberIndex: number,
    newEmail: string,
  ): void => {
    const temp = { ...dataState };
    dataState[personId].emailAddresses[numberIndex].email = newEmail;
    setDataState(temp);
  };

  // Change the primary address in the state
  const handleChangePrimary = (personId: string, emailIndex: number): void => {
    const temp = { ...dataState };
    if (temp[personId]) {
      temp[personId].emailAddresses = temp[personId].emailAddresses.map(
        (email, index) => ({
          ...email,
          primary: index === emailIndex,
        }),
      );
    }
    setDataState(temp);
  };

  const handleSourceChange = (event: SelectChangeEvent<unknown>): void => {
    setDefaultSource(event.target.value as string);
  };

  const handleSingleConfirm = async (
    person: PersonInvalidEmailFragment,
    emails: EmailAddressData[],
  ) => {
    const personName = `${person.firstName} ${person.lastName}`;
    const emailAddresses = [] as PersonEmailAddressInput[];
    emails.map((emailAddress) => {
      emailAddresses.push({
        email: emailAddress.email,
        id: emailAddress.id,
        primary: emailAddress.primary,
        validValues: true,
      });
    });

    await updateEmailAddressesMutation({
      variables: {
        input: {
          accountListId,
          attributes: {
            id: person.id,
            emailAddresses,
          },
        },
      },
      update: (cache) => {
        cache.evict({ id: `Person:${person.id}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(
          t(`Successfully updated email addresses for ${personName}`),
          {
            variant: 'success',
          },
        );
      },
      onError: () => {
        enqueueSnackbar(t(`Error updating email addresses for ${personName}`), {
          variant: 'error',
          autoHideDuration: 7000,
        });
      },
    });
  };

  const handleBulkConfirm = async () => {
    const dataToSend = determineBulkDataToSend(dataState, defaultSource ?? '');

    if (dataToSend.length) {
      await updatePeople({
        variables: {
          input: {
            accountListId,
            attributes: dataToSend,
          },
        },
        update: (cache) => {
          data?.people.nodes.forEach((person) => {
            cache.evict({ id: `Person:${person.id}` });
          });
          cache.gc();
        },
        onCompleted: () => {
          enqueueSnackbar(t(`Successfully updated email addresses`), {
            variant: 'success',
          });
        },
        onError: () => {
          enqueueSnackbar(t(`Error updating email addresses`), {
            variant: 'error',
            autoHideDuration: 7000,
          });
        },
      });
    } else {
      enqueueSnackbar(
        t(`No {{source}} primary email address exists to update`, {
          source: sourceToStr(t, defaultSource),
        }),
        {
          variant: 'warning',
          autoHideDuration: 7000,
        },
      );
    }
  };

  return (
    <Container>
      {data && dataState ? (
        <ToolsGridContainer container spacing={3}>
          <Grid item xs={12}>
            <Box mb={2}>
              {!!data.people.nodes.length && (
                <>
                  <Typography>
                    <strong>
                      {t('You have {{amount}} email addresses to confirm.', {
                        amount: data.people.nodes.length,
                      })}
                    </strong>
                  </Typography>
                  <Typography>
                    {t(
                      'Choose below which email address will be set as primary.',
                    )}
                  </Typography>
                  <DefaultSourceWrapper>
                    <Typography>{t('Default Primary Source:')}</Typography>

                    <SourceSelect
                      value={defaultSource}
                      onChange={handleSourceChange}
                      size="small"
                    >
                      {sourceOptions.map((source) => (
                        <MenuItem key={source} value={source}>
                          {sourceToStr(t, source)}
                        </MenuItem>
                      ))}
                    </SourceSelect>
                    <ConfirmButton
                      variant="contained"
                      onClick={() => setShowBulkConfirmModal(true)}
                    >
                      <ConfirmButtonIcon />
                      {t('Confirm {{amount}} as {{source}}', {
                        amount: data.people.nodes.length,
                        source: sourceToStr(t, defaultSource),
                      })}
                    </ConfirmButton>
                  </DefaultSourceWrapper>
                </>
              )}
            </Box>
          </Grid>
          {!!data.people.nodes.length ? (
            <Grid item xs={12}>
              <InfiniteList
                loading={loading}
                data={data.people.nodes}
                itemContent={(index, person) => (
                  <Grid item xs={12}>
                    <Box>
                      <FixEmailAddressPerson
                        person={person}
                        key={person.id}
                        dataState={dataState}
                        accountListId={accountListId}
                        handleChange={handleChange}
                        handleChangePrimary={handleChangePrimary}
                        handleSingleConfirm={handleSingleConfirm}
                      />
                    </Box>
                  </Grid>
                )}
                endReached={() =>
                  data.people.pageInfo.hasNextPage &&
                  fetchMore({
                    variables: { after: data.people.pageInfo.endCursor },
                  })
                }
                EmptyPlaceholder={<NoData tool="fixEmailAddresses" />}
                style={{
                  height: `calc(100vh - ${navBarHeight} - ${theme.spacing(
                    33,
                  )})`,
                  width: '100%',
                  scrollbarWidth: 'none',
                }}
                ItemOverride={ItemOverride}
                increaseViewportBy={{ top: 2000, bottom: 2000 }}
              ></InfiniteList>
              <Grid item xs={12}>
                <Box width="100%" display="flex" justifyContent="center">
                  <Typography>
                    <Trans
                      defaults="Showing <bold>{{value}}</bold> of <bold>{{total}}</bold>"
                      shouldUnescape
                      values={{
                        value: data.people.nodes.length,
                        total: data.people.totalCount,
                      }}
                      components={{ bold: <strong /> }}
                    />
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <NoData tool="fixEmailAddresses" />
          )}
        </ToolsGridContainer>
      ) : (
        <CircularProgress
          data-testid="loading"
          style={{ marginTop: theme.spacing(3) }}
        />
      )}
      <Confirmation
        isOpen={showBulkConfirmModal}
        handleClose={() => setShowBulkConfirmModal(false)}
        mutation={handleBulkConfirm}
        title={t('Confirm')}
        message={t(`You are updating all contacts visible on this page, setting the first ${sourceToStr(
          t,
          defaultSource,
        )} email address as the
          primary email address. If no such email address exists the contact will not be updated.
          Are you sure you want to do this?`)}
      />
    </Container>
  );
};
