import React, { useState } from 'react';
import { Box, CircularProgress, Grid, Theme, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { Trans, useTranslation } from 'react-i18next';
import { ItemProps } from 'react-virtuoso';
import { makeStyles } from 'tss-react/mui';
import {
  InfiniteList,
  ItemWithBorders,
} from 'src/components/InfiniteList/InfiniteList';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import { PledgeFrequencyEnum, StatusEnum } from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import theme from '../../../theme';
import NoData from '../NoData';
import { ToolsGridContainer } from '../styledComponents';
import Contact from './Contact';
import { useInvalidStatusesQuery } from './GetInvalidStatuses.generated';
import { useUpdateStatusMutation } from './UpdateStatus.generated';

const useStyles = makeStyles()((theme: Theme) => ({
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

export interface DonationsType {
  id: string;
  amount: {
    amount: number;
    currency: string;
    conversionDate: string;
  };
}

export interface SuggestedChangesType {
  status: string;
  pledge_amount: string | number;
  pledge_frequency: string;
}

export interface ContactType {
  id?: string | undefined;
  status?: string | undefined;
  name?: string | undefined;
  pledgeCurrency?: string | undefined;
  pledgeAmount?: string | number | undefined;
  pledgeFrequency?: PledgeFrequencyEnum | string | null;
  donations?: DonationsType[] | [];
  suggestedChanges?: SuggestedChangesType | string | undefined;
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
}

export enum UpdateTypeEnum {
  Change = 'CHANGE',
  DontChange = 'DONT_CHANGE',
  Hide = 'HIDE',
}

const ItemOverride: React.ComponentType<ItemProps> = (props) => (
  <ItemWithBorders disableGutters disableHover {...props} />
);

const FixCommitmentInfo: React.FC<Props> = ({ accountListId }: Props) => {
  const { classes } = useStyles();
  const [modalState, setModalState] =
    useState<ModalStateType>(defaultModalState);
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { appName } = useGetAppSettings();
  const { data, loading, fetchMore } = useInvalidStatusesQuery({
    variables: { accountListId },
  });

  const [updateInvalidStatus] = useUpdateStatusMutation();

  const formatSuggestedChanges = (
    suggestedChanges: SuggestedChangesType | string | undefined | null,
  ) => {
    if (typeof suggestedChanges !== 'string') {
      return {};
    }

    try {
      return JSON.parse(suggestedChanges);
    } catch (error) {
      return {};
    }
  };

  const updateContact = async (): Promise<void> => {
    let attributes;

    switch (modalState.updateType) {
      case 'CHANGE':
        attributes = {
          id: modalState.contact.id,
          status: modalState.contact.status,
          pledgeAmount: modalState.contact.pledgeAmount,
          pledgeCurrency: modalState.contact.pledgeCurrency,
          pledgeFrequency: modalState.contact.pledgeFrequency,
          statusValid: true,
        };
        break;
      case 'DONT_CHANGE':
        attributes = {
          id: modalState.contact.id,
          statusValid: true,
        };
        break;
      case 'HIDE':
        attributes = {
          id: modalState.contact.id,
          status: StatusEnum.NeverAsk,
        };
        break;
    }

    await updateInvalidStatus({
      variables: {
        accountListId,
        attributes,
      },
      update: (cache) => {
        cache.evict({ id: `Contact:${modalState.contact.id}` });
      },
      onError() {
        enqueueSnackbar(
          t(`Error updating {{name}}'s commitment info`, {
            name: modalState.contact.name,
          }),
          {
            variant: 'error',
          },
        );
      },
      onCompleted() {
        enqueueSnackbar(
          t(`{{name}}'s commitment info updated!`, {
            name: modalState.contact.name,
          }),
          {
            variant: 'success',
          },
        );
      },
    });
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
      {data ? (
        <ToolsGridContainer container spacing={3} data-testid="Container">
          {data.contacts?.nodes.length > 0 ? (
            <>
              <Grid item xs={12}>
                <Box
                  className={classes.descriptionBox}
                  data-testid="Description"
                >
                  <Typography>
                    <strong>
                      {t('You have {{amount}} partner statuses to confirm.', {
                        amount: data?.contacts.totalCount,
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
              <InfiniteList
                loading={loading}
                data={data.contacts.nodes}
                itemContent={(_, contact) => (
                  <Grid item xs={12}>
                    <Box>
                      <Contact
                        id={contact.id}
                        name={contact.name}
                        key={contact.id}
                        donations={contact.donations?.nodes}
                        currentStatus={contact.status || undefined}
                        amount={contact.pledgeAmount || 0}
                        amountCurrency={contact.pledgeCurrency || ''}
                        frequencyValue={contact.pledgeFrequency || ''}
                        showModal={handleShowModal}
                        avatar={contact?.avatar}
                        suggestedChanges={formatSuggestedChanges(
                          contact?.suggestedChanges,
                        )}
                      />
                    </Box>
                  </Grid>
                )}
                endReached={() =>
                  data.contacts.pageInfo.hasNextPage &&
                  fetchMore({
                    variables: { after: data.contacts.pageInfo.endCursor },
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
              />
            </>
          ) : (
            <NoData tool="fixCommitmentInfo" />
          )}
        </ToolsGridContainer>
      ) : (
        <CircularProgress style={{ marginTop: theme.spacing(3) }} />
      )}
      {modalState.open && (
        <Confirmation
          data-testid="HideModal"
          isOpen={true}
          title={modalState.title}
          message={
            <Trans
              defaults="{{message}}"
              tOptions={{ interpolation: { escapeValue: false } }}
              shouldUnescape
              values={{ message: modalState.message }}
              components={{ bold: <strong /> }}
            />
          }
          handleClose={() => setModalState(defaultModalState)}
          mutation={updateContact}
        />
      )}
    </Box>
  );
};

export default FixCommitmentInfo;
