import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  Theme,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { useContactFiltersQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import { InfiniteList } from 'src/components/InfiniteList/InfiniteList';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
// import { headerHeight } from 'src/components/Shared/Header/ListHeader';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import {
  MultiselectFilter,
  PledgeFrequencyEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';
import theme from '../../../theme';
import NoData from '../NoData';
import Contact from './Contact';
import {
  GetInvalidStatusesDocument,
  GetInvalidStatusesQuery,
  useGetInvalidStatusesQuery,
} from './GetInvalidStatuses.generated';
import { frequencies } from './InputOptions/Frequencies';
import { useUpdateStatusMutation } from './UpdateStatus.generated';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    padding: theme.spacing(3),
    width: '70%',
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  toolIcon: {
    height: theme.spacing(5),
    width: theme.spacing(5),
    color: theme.palette.cruGrayDark.main,
  },
  outer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  descriptionBox: {
    marginBottom: theme.spacing(2),
  },
  footer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
}));

export interface ContactType {
  id?: string | undefined;
  status?: string | undefined;
  name?: string | undefined;
  pledgeCurrency?: string | undefined;
  pledgeAmount?: number | undefined;
  pledgeFrequency?: string | undefined;
}

export interface ModalStateType {
  open: boolean;
  contact: ContactType;
  message: string;
  title: string;
  updateType: UpdateTypeEnum | null;
}

const defaultModalState = {
  open: false,
  contact: {},
  message: '',
  title: '',
  updateType: null,
};

interface Props {
  accountListId: string;
  setContactFocus: SetContactFocus;
}

export enum UpdateTypeEnum {
  Change = 'CHANGE',
  DontChange = 'DONT_CHANGE',
  Hide = 'HIDE',
}

const FixCommitmentInfo: React.FC<Props> = ({
  accountListId,
  setContactFocus,
}: Props) => {
  const { classes } = useStyles();
  const [modalState, setModalState] =
    useState<ModalStateType>(defaultModalState);
  const [descriptionBoxHeight, setDescriptionBoxHeight] = useState<number>(0);
  const descriptionBoxRef = useRef<HTMLDivElement | null>(null);
  const headingBoxRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { appName } = useGetAppSettings();
  const client = useApolloClient();
  const { data, loading, fetchMore } = useGetInvalidStatusesQuery({
    variables: { accountListId },
  });

  useEffect(() => {
    if (descriptionBoxRef.current && headingBoxRef.current) {
      setDescriptionBoxHeight(
        descriptionBoxRef?.current.clientHeight +
          headingBoxRef?.current.clientHeight,
      );
    }
  });

  const { data: contactFilterGroups, loading: loadingStatuses } =
    useContactFiltersQuery({
      variables: {
        accountListId,
      },
      context: {
        doNotBatch: true,
      },
    });

  const [updateInvalidStatus, { loading: updating }] =
    useUpdateStatusMutation();

  const contactStatuses = contactFilterGroups?.accountList?.contactFilterGroups
    ? (
        contactFilterGroups.accountList.contactFilterGroups
          .find((group) => group?.filters[0]?.filterKey === 'status')
          ?.filters.find(
            (filter: { filterKey: string }) => filter.filterKey === 'status',
          ) as MultiselectFilter
      ).options?.filter(
        (status) =>
          status.value !== 'NULL' &&
          status.value !== 'HIDDEN' &&
          status.value !== 'ACTIVE',
      )
    : [{ name: '', value: '' }];

  const updateContact = async (
    updateType: UpdateTypeEnum,
    name?: string,
    id?: string,
    status?: string,
    pledgeCurrency?: string,
    pledgeAmount?: number,
    pledgeFrequency?: string,
  ): Promise<void> => {
    let errorOccurred = false;
    let attributes;

    switch (updateType) {
      case 'CHANGE':
        attributes = {
          id,
          status: status as StatusEnum,
          pledgeAmount,
          pledgeCurrency,
          pledgeFrequency: pledgeFrequency as PledgeFrequencyEnum,
          statusValid: true,
        };
        break;
      case 'DONT_CHANGE':
        attributes = {
          id,
          statusValid: true,
        };
        break;
      case 'HIDE':
        attributes = {
          id,
          status: 'NEVER_ASK' as StatusEnum,
        };
        break;
    }

    await updateInvalidStatus({
      variables: {
        accountListId,
        attributes,
      },
      onError() {
        errorOccurred = true;
      },
    });

    if (errorOccurred) {
      enqueueSnackbar(t(`Error updating ${name}'s commitment info`), {
        variant: 'error',
        autoHideDuration: 7000,
      });
    } else {
      enqueueSnackbar(t(`${name}'s commitment info updated!`), {
        variant: 'success',
        autoHideDuration: 7000,
      });
      hideContactFromView(id);
    }
  };

  const hideContactFromView = (hideId?: string): void => {
    const query = {
      query: GetInvalidStatusesDocument,
      variables: {
        accountListId,
      },
    };

    const dataFromCache = client.readQuery<GetInvalidStatusesQuery>(query);

    if (dataFromCache) {
      const data = {
        ...dataFromCache,
        contacts: {
          ...dataFromCache.contacts,
          nodes: dataFromCache.contacts.nodes.filter(
            (contact) => contact.id !== hideId,
          ),
        },
      };

      client.writeQuery({ ...query, data });
    }
  };

  const handleShowModal = (
    contact: ContactType,
    message: string,
    title: string,
    updateType: UpdateTypeEnum,
  ) => {
    setModalState({
      open: true,
      contact,
      message,
      title,
      updateType,
    });
  };

  return (
    <Box className={classes.outer} data-testid="Home">
      {!updating && !loadingStatuses && data ? (
        <Grid container className={classes.container} data-testid="Container">
          <Grid item xs={12} ref={headingBoxRef}>
            <Typography variant="h4">{t('Fix Commitment Info')}</Typography>
            <Divider className={classes.divider} data-testid="Divider" />
          </Grid>
          {data.contacts?.nodes.length > 0 ? (
            <>
              <Grid item xs={12} ref={descriptionBoxRef}>
                <Box
                  className={classes.descriptionBox}
                  data-testid="Description"
                >
                  <Typography>
                    <strong>
                      {t('You have {{amount}} partner statuses to confirm.', {
                        amount: data?.contacts.nodes.length,
                      })}
                    </strong>
                  </Typography>
                  <Typography>
                    {t(
                      '{{appName}} has assigned partnership statuses and giving frequencies ' +
                        'based on your partner’s giving history. {{appName}} has made its best ' +
                        'attempt at matching the appropriate statuses for you. However, ' +
                        'you will need to confirm them to be sure {{appName}}’s matching was ' +
                        'accurate.',
                      { appName },
                    )}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <InfiniteList
                  loading={loading}
                  data={data?.contacts?.nodes ?? []}
                  style={{
                    height: `calc(100vh - ${navBarHeight} - ${descriptionBoxHeight}px - ${theme.spacing(
                      5,
                    )})`,
                    border: 'none !important',
                  }}
                  itemContent={(index, contact) => (
                    <Grid item xs={12}>
                      <Contact
                        id={contact.id}
                        name={contact.name}
                        key={contact.id}
                        donations={contact.donations?.nodes}
                        statusTitle={
                          contact.status
                            ? contactPartnershipStatus[contact.status]
                            : ''
                        }
                        statusValue={contact.status || ''}
                        amount={contact.pledgeAmount || 0}
                        amountCurrency={contact.pledgeCurrency || ''}
                        frequencyTitle={
                          contact.pledgeFrequency
                            ? frequencies[contact.pledgeFrequency]
                            : ''
                        }
                        frequencyValue={contact.pledgeFrequency || ''}
                        showModal={handleShowModal}
                        statuses={contactStatuses || [{ name: '', value: '' }]}
                        setContactFocus={setContactFocus}
                      />
                    </Grid>
                  )}
                  endReached={() =>
                    data?.contacts?.pageInfo.hasNextPage &&
                    fetchMore({
                      variables: {
                        after: data.contacts?.pageInfo.endCursor,
                      },
                    })
                  }
                />
              </Grid>
            </>
          ) : (
            <NoData tool="fixCommitmentInfo" />
          )}
        </Grid>
      ) : (
        <CircularProgress style={{ marginTop: theme.spacing(3) }} />
      )}
      {modalState.open && (
        <Confirmation
          data-testid="HideModal"
          isOpen={true}
          title={modalState.title}
          message={modalState.message}
          handleClose={() => setModalState(defaultModalState)}
          mutation={() =>
            updateContact(
              modalState.updateType!,
              modalState.contact.name,
              modalState.contact.id,
              modalState.contact.status,
              modalState.contact.pledgeCurrency,
              modalState.contact.pledgeAmount,
              modalState.contact.pledgeFrequency,
            )
          }
        />
      )}
    </Box>
  );
};

export default FixCommitmentInfo;
