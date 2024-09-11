import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { DialogActions, DialogContent, DialogContentText } from '@mui/material';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { Trans, useTranslation } from 'react-i18next';
import { useGetContactDonationsQuery } from 'src/components/Contacts/ContactDetails/ContactDonationsTab/ContactDonationsTab.generated';
import { DonationRow } from 'src/components/DonationTable/DonationTable';
import {
  DonationTableQueryVariables,
  useAccountListCurrencyQuery,
  useDonationTableQuery,
} from 'src/components/DonationTable/DonationTable.generated';
import { EmptyDonationsTable } from 'src/components/common/EmptyDonationsTable/EmptyDonationsTable';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import Modal from 'src/components/common/Modal/Modal';
import { PledgeStatusEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { AppealContactInfoFragment } from '../../AppealsContext/contacts.generated';
import {
  useCreateAccountListPledgeMutation,
  useUpdateAccountListPledgeMutation,
} from '../PledgeModal/ContactPledge.generated';
import { DonationTable } from './DonationTable/DonationTable';
import { useUpdateDonationsMutation } from './UpdateDonations.generated';
import { connectDonations, disconnectDonations } from './UpdateDonationsHelper';

export interface UpdateDonationsModalProps {
  contact: {
    id: string;
    name: string;
  };
  pledge?: AppealContactInfoFragment['pledges'][0];
  handleClose: () => void;
}

export const UpdateDonationsModal: React.FC<UpdateDonationsModalProps> = ({
  contact,
  pledge,
  handleClose,
}) => {
  const locale = useLocale();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { accountListId, appealId } = React.useContext(
    AppealsContext,
  ) as AppealsType;
  const [selectedDonations, setSelectedDonations] = useState<DonationRow[]>([]);
  const [
    lessThanPledgeConfirmationMessage,
    setLessThanPledgeConfirmationMessage,
  ] = useState<ReactNode | null>(null);
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [pageSize, setPageSize] = useState(25);

  const { data: accountListData, loading: loadingAccountListData } =
    useAccountListCurrencyQuery({
      variables: { accountListId: accountListId ?? '' },
    });
  const accountCurrency = accountListData?.accountList.currency || 'USD';

  const { data } = useGetContactDonationsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactId: contact.id,
    },
  });
  const donorAccountIds = useMemo(
    () =>
      data?.contact.contactDonorAccounts.nodes.map(
        (donor) => donor.donorAccount.id,
      ),
    [data],
  );

  const totalSelectedDonationsAmount = useMemo(
    () =>
      selectedDonations.reduce<number>(
        (total, current) => total + current.convertedAmount,
        0,
      ),
    [selectedDonations],
  );

  // pageSize is intentionally omitted from the dependencies array so that the query isn't rerun when the page size changes
  // If all the pages have loaded and the user changes the page size, there's no reason to reload all the pages
  // TODO: sort donations on the server after https://jira.cru.org/browse/MPDX-7634 is implemented
  const variables: DonationTableQueryVariables = useMemo(
    () => ({
      accountListId: accountListId ?? '',
      pageSize,
      donorAccountIds,
    }),
    [accountListId, pageSize, donorAccountIds],
  );

  const donationTableQueryResult = useDonationTableQuery({
    variables,
    skip: !donorAccountIds,
  });

  const [updateDonations] = useUpdateDonationsMutation();
  const [createAccountListPledge] = useCreateAccountListPledgeMutation();
  const [updateAccountListPledge] = useUpdateAccountListPledgeMutation();

  const handleUpdateDonations = async () => {
    if (!totalSelectedDonationsAmount) {
      enqueueSnackbar(t('Unable to create a pledge with the amount of $0'), {
        variant: 'error',
      });
      return;
    } else if (pledge && totalSelectedDonationsAmount < pledge.amount) {
      setLessThanPledgeConfirmationMessage(
        <Trans
          defaults="The total amount is less than the commitment amount. Would you like to update the commitment amount to match the total? If not, the contact will be moved to the <bold>Received</bold> column."
          components={{ bold: <strong /> }}
        />,
      );
    } else {
      if (pledge) {
        await commit({
          updatedPledge: {
            ...pledge,
            amount: totalSelectedDonationsAmount,
            amountCurrency: pledge?.amountCurrency ?? 'USD',
            status: PledgeStatusEnum.Processed,
          },
        });
      } else {
        await commit({});
      }
    }
  };

  const lessThanPledgeConfirmationMutation = async () => {
    if (pledge) {
      try {
        await commit({
          updatedPledge: {
            ...pledge,
            amount: totalSelectedDonationsAmount,
            amountCurrency: pledge.amountCurrency,
            status: PledgeStatusEnum.Processed,
          },
        });
      } catch (error) {
        await commit({
          updatedPledge: {
            ...pledge,
            status: PledgeStatusEnum.ReceivedNotProcessed,
          },
        });
      }

      setLessThanPledgeConfirmationMessage(null);
      handleClose();
    }
  };
  const handleLessThanPledgeConfirmationDecline = async () => {
    if (pledge) {
      await commit({
        updatedPledge: {
          ...pledge,
          status: PledgeStatusEnum.ReceivedNotProcessed,
        },
      });

      setLessThanPledgeConfirmationMessage(null);
      handleClose();
    }
  };

  type CommitProps = {
    updatedPledge?: AppealContactInfoFragment['pledges'][0];
  };
  const commit = async ({ updatedPledge }: CommitProps) => {
    // Fetch all donations that should be updated
    const donationsAttributes = [
      ...disconnectDonations({
        selectedDonations,
        donationTableQueryResult,
        appealId: appealId ?? '',
      }),
      ...connectDonations({
        selectedDonations,
        donationTableQueryResult,
        appealId: appealId ?? '',
        pledge: updatedPledge,
      }),
    ];
    if (donationsAttributes.length) {
      // Update donations to be connected or disconnected from the pledge
      await updateDonations({
        variables: {
          input: {
            accountListId: accountListId ?? '',
            attributes: donationsAttributes,
          },
        },
        refetchQueries: ['Contacts', 'Appeal'],
        onCompleted: () => {
          enqueueSnackbar(t('Successfully updated donations'), {
            variant: 'success',
          });
          if (!updatedPledge) {
            enqueueSnackbar(t('Successfully created a new commitment'), {
              variant: 'success',
            });
          }
        },
        onError: () => {
          enqueueSnackbar(t('Error while updating donations'), {
            variant: 'error',
          });
        },
      });
    }
    if (updatedPledge?.id) {
      const { __typename, appeal, ...pledgeDetails } = updatedPledge;
      // Update current pledge with passed in pledge data
      await updateAccountListPledge({
        variables: {
          input: {
            pledgeId: updatedPledge.id,
            attributes: {
              appealId: appeal.id,
              contactId: contact.id,
              ...pledgeDetails,
            },
          },
        },
        refetchQueries: ['Contacts', 'Appeal'],
        onCompleted: () => {
          enqueueSnackbar(t('Successfully updated commitment'), {
            variant: 'success',
          });
        },
        onError: () => {
          enqueueSnackbar(t('Error while updating commitment'), {
            variant: 'error',
          });
        },
      });
    } else if (!donationsAttributes.length) {
      // Create pledge if no pledge and no donations
      await createAccountListPledge({
        variables: {
          input: {
            accountListId: accountListId ?? '',
            attributes: {
              appealId: appealId,
              contactId: contact.id,
              expectedDate: DateTime.local().startOf('day').toISODate(),
              amount: totalSelectedDonationsAmount,
              amountCurrency: accountCurrency,
            },
          },
        },
        refetchQueries: ['Contacts', 'Appeal'],
        onCompleted: () => {
          enqueueSnackbar(t('Successfully created a new commitment'), {
            variant: 'success',
          });
        },
        onError: () => {
          enqueueSnackbar(t('Error while trying to create a commitment'), {
            variant: 'error',
          });
        },
      });
    }
    handleClose();
  };

  useEffect(() => {
    if (donationTableQueryResult.data?.donations.nodes.length) {
      if (!!selectedDonations.length) {
        setSaveDisabled(false);
      } else {
        setSaveDisabled(true);
      }
    } else {
      setSaveDisabled(true);
    }

    saveDisabled;
    setSaveDisabled;
  }, [selectedDonations, donationTableQueryResult.data?.donations.nodes]);

  return (
    <>
      <Modal
        isOpen={true}
        title={t('Update Donations')}
        handleClose={handleClose}
        size="md"
      >
        <DialogContent dividers>
          <DialogContentText
            component="div"
            mb={2}
            pl={1}
            color={theme.palette.common.black}
          >
            {pledge
              ? t(
                  'Select donations that make up this commitment by {{name}} of {{amount}}.',
                  {
                    name: contact.name,
                    amount: currencyFormat(
                      pledge?.amount ?? 0,
                      pledge?.amountCurrency,
                      locale,
                    ),
                  },
                )
              : t(
                  'Select donations that make up this commitment by {{name}}.',
                  {
                    name: contact.name,
                  },
                )}
          </DialogContentText>

          <DonationTable
            appealId={appealId ?? ''}
            filter={{ donorAccountIds }}
            loading={!donorAccountIds && loadingAccountListData}
            emptyPlaceholder={
              <EmptyDonationsTable
                title={t('No donations received for {{name}}', {
                  name: data?.contact.name,
                })}
              />
            }
            accountCurrency={accountCurrency}
            visibleColumnsStorageKey="contact-donations"
            selectedDonations={selectedDonations}
            setSelectedDonations={setSelectedDonations}
            totalSelectedDonationsAmount={totalSelectedDonationsAmount}
            pageSize={pageSize}
            setPageSize={setPageSize}
            donationTableQueryResult={donationTableQueryResult}
          />
        </DialogContent>
        <DialogActions>
          <CancelButton onClick={handleClose}>{t('Cancel')}</CancelButton>
          <SubmitButton
            type="button"
            onClick={handleUpdateDonations}
            disabled={saveDisabled}
          >
            {t('Save')}
          </SubmitButton>
        </DialogActions>
      </Modal>

      {lessThanPledgeConfirmationMessage && (
        <Confirmation
          isOpen={true}
          title={t('Confirm')}
          handleDecline={handleLessThanPledgeConfirmationDecline}
          handleClose={() => setLessThanPledgeConfirmationMessage(null)}
          message={lessThanPledgeConfirmationMessage}
          mutation={lessThanPledgeConfirmationMutation}
        />
      )}
    </>
  );
};
