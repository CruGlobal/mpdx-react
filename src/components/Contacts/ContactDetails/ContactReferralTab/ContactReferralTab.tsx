import NextLink from 'next/link';
import React, { useState } from 'react';
import Add from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  IconButton,
  Link,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  DynamicCreateMultipleContacts,
  preloadCreateMultipleContacts,
} from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/Items/CreateMultipleContacts/DynamicCreateMultipleContacts';
import { useContactPanel } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import { Confirmation } from 'src/components/Shared/Modal/Confirmation/Confirmation';
import Modal from 'src/components/Shared/Modal/Modal';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat';
import {
  useContactReferralTabQuery,
  useDeleteContactReferralMutation,
} from './ContactReferralTab.generated';

const ContactReferralContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0),
  marginTop: theme.spacing(-1),
}));

const ContactReferralLoadingPlaceHolder = styled(Skeleton)(({ theme }) => ({
  width: '100%',
  height: '24px',
  margin: theme.spacing(2, 0),
}));

const ReferralName = styled(Typography)(() => ({
  width: 'fit-content',
}));

const AddButton = styled(Button)(({ theme }) => ({
  fontWeight: 600,
  margin: theme.spacing(0.5),
  color: theme.palette.info.main,
}));

interface ReferralToRemove {
  id: string;
  name: string;
}

interface ContactReferralTabProps {
  accountListId: string;
  contactId: string;
}

export const ContactReferralTab: React.FC<ContactReferralTabProps> = ({
  accountListId,
  contactId,
}) => {
  const { buildContactUrl } = useContactPanel();

  const { data, error, fetchMore } = useContactReferralTabQuery({
    variables: {
      accountListId,
      contactId: contactId,
    },
  });
  useFetchAllPages({
    fetchMore,
    error,
    pageInfo: data?.contact.contactReferralsByMe.pageInfo,
  });

  const { t } = useTranslation();
  const locale = useLocale();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteContactReferral] = useDeleteContactReferralMutation();
  const [modalContactReferralOpen, setModalContactReferralOpen] =
    useState(false);
  const [referralToRemove, setReferralToRemove] =
    useState<ReferralToRemove | null>(null);

  const handleModalOpen = () => {
    setModalContactReferralOpen(true);
  };

  const handleModalClose = () => {
    setModalContactReferralOpen(false);
  };

  const handleRemoveReferral = async () => {
    if (!referralToRemove) {
      return;
    }
    await deleteContactReferral({
      variables: {
        accountListId,
        contactId,
        referralId: referralToRemove.id,
      },
      update: (cache) => {
        const cacheId = cache.identify({
          __typename: 'Referral',
          id: referralToRemove.id,
        });
        if (cacheId) {
          cache.evict({ id: cacheId });
          cache.gc();
        }
      },
      onCompleted: () => {
        enqueueSnackbar(t('Connection removed successfully'), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(t('Unable to remove connection'), {
          variant: 'error',
        });
      },
    });
  };

  return (
    <ContactReferralContainer>
      {!data ? (
        <>
          <ContactReferralLoadingPlaceHolder />
          <ContactReferralLoadingPlaceHolder />
          <ContactReferralLoadingPlaceHolder />
        </>
      ) : (
        <>
          <Box width="100%" mb={2} justifyContent="end" display="flex">
            <AddButton
              onClick={handleModalOpen}
              onMouseEnter={preloadCreateMultipleContacts}
            >
              <Add />
              {t('Add Connections')}
            </AddButton>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('Name')}</TableCell>
                  <TableCell>{t('Date of Connection')}</TableCell>
                  <TableCell align="right">{t('Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.contact &&
                data.contact.contactReferralsByMe.nodes.length > 0 ? (
                  data?.contact.contactReferralsByMe.nodes.map(
                    ({ id, referredTo, createdAt }) => (
                      <TableRow key={id}>
                        <TableCell>
                          <ReferralName>
                            <Link
                              component={NextLink}
                              href={buildContactUrl(referredTo.id)}
                              shallow
                            >
                              {referredTo.name}
                            </Link>
                          </ReferralName>
                        </TableCell>
                        <TableCell>
                          <Typography>
                            {dateFormat(DateTime.fromISO(createdAt), locale)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            aria-label={t('Remove Connection {{name}}', {
                              name: referredTo.name,
                            })}
                            onClick={() =>
                              setReferralToRemove({
                                id,
                                name: referredTo.name,
                              })
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ),
                  )
                ) : (
                  <TableRow key="no_data">
                    <TableCell colSpan={3}>{t('No Connections')}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Modal
            isOpen={modalContactReferralOpen}
            handleClose={handleModalClose}
            title={t('Add Connections')}
            aria-labelledby={t('Create Connection Dialog')}
            fullWidth
            size={'xl'} // TODO: Expand logic as more menu modals are added
          >
            <DynamicCreateMultipleContacts
              accountListId={accountListId}
              handleClose={handleModalClose}
              referredById={contactId}
            />
          </Modal>
          <Confirmation
            isOpen={!!referralToRemove}
            title={t('Remove Connection')}
            message={t(
              'Are you sure you want to remove {{name}} as a connection?',
              { name: referralToRemove?.name ?? '' },
            )}
            confirmButtonProps={{ color: 'error' }}
            handleClose={() => setReferralToRemove(null)}
            mutation={handleRemoveReferral}
          />
        </>
      )}
    </ContactReferralContainer>
  );
};
