import React, { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Grid,
  Hidden,
  IconButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { TFunction } from 'i18next';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  ListItemButton,
  StyledCheckbox,
} from 'src/components/Contacts/ContactRow/ContactRow';
import { preloadContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { getLocalizedPledgeFrequency } from 'src/utils/functions/getLocalizedPledgeFrequency';
import {
  AppealStatusEnum,
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { AppealContactInfoFragment } from '../../AppealsContext/contacts.generated';
import {
  DynamicAddExcludedContactModal,
  preloadAddExcludedContactModal,
} from '../../Modals/AddExcludedContactModal/DynamicAddExcludedContactModal';
import {
  DynamicDeleteAppealContactModal,
  preloadDeleteAppealContactModal,
} from '../../Modals/DeleteAppealContact/DynamicDeleteAppealContactModal';
import {
  DynamicDeletePledgeModal,
  preloadDeletePledgeModal,
} from '../../Modals/DeletePledgeModal/DynamicDeletePledgeModal';
import {
  DynamicPledgeModal,
  preloadPledgeModal,
} from '../../Modals/PledgeModal/DynamicPledgeModal';
import { PledgeModalEnum } from '../../Modals/PledgeModal/PledgeModal';

// When making changes in this file, also check to see if you don't need to make changes to the below file
// src/components/Contacts/ContactRow/ContactRow.tsx

const ListButton = styled(ListItemButton)(() => ({
  '&:hover .contactRowActions': {
    opacity: 1,
  },
}));
const ContactRowActions = styled(Box)(() => ({
  opacity: 0,
  transition: 'opacity 0.3s',
}));

type FormatPledgeOrDonationProps = {
  amount?: number | null;
  currency?: string | null;
  appealStatus: AppealStatusEnum;
  date?: any;
  locale: string;
  t: TFunction;
};

const formatPledgeOrDonation = ({
  amount,
  currency,
  appealStatus,
  date,
  locale,
  t,
}: FormatPledgeOrDonationProps) => {
  const pledgeOrDonationAmount =
    amount && currency
      ? currencyFormat(amount, currency, locale)
      : amount || currencyFormat(0, currency, locale);

  const pledgeOrDonationDate =
    appealStatus === AppealStatusEnum.Asked ||
    appealStatus === AppealStatusEnum.Excluded
      ? (date && getLocalizedPledgeFrequency(t, date)) ?? ''
      : date
      ? dateFormat(DateTime.fromISO(date), locale)
      : null;
  return {
    amount: pledgeOrDonationAmount,
    date: pledgeOrDonationDate,
  };
};

interface Props {
  contact: AppealContactInfoFragment;
  appealStatus: AppealStatusEnum;
  useTopMargin?: boolean;
}

export type PledgeInfo = {
  id?: string;
  contactId: string;
  amount: number;
  currency: string;
  expectedDate: string;
  status: string;
};

export const ContactRow: React.FC<Props> = ({
  contact,
  appealStatus,
  useTopMargin,
}) => {
  const {
    appealId,
    isRowChecked: isChecked,
    contactDetailsOpen,
    setContactFocus: onContactSelected,
    toggleSelectionById: onContactCheckToggle,
  } = React.useContext(AppealsContext) as AppealsType;
  const { t } = useTranslation();
  const locale = useLocale();
  const [createPledgeModalOpen, setPledgeModalOpen] = useState(false);
  const [deletePledgeModalOpen, setDeletePledgeModalOpen] = useState(false);
  const [addExcludedContactModalOpen, setAddExcludedContactModalOpen] =
    useState(false);
  const [removeContactModalOpen, setRemoveContactModalOpen] = useState(false);
  const [pledgeModalType, setPledgeModalType] = useState(
    PledgeModalEnum.Create,
  );
  const [pledgeValues, setPledgeValues] = useState<PledgeInfo>();
  const [amountAndFrequency, setAmountAndFrequency] = useState<string>();
  const [pledgeDonations, setPledgeDonations] = useState<string[] | null>();

  const handleContactClick = () => {
    onContactSelected(contact.id);
  };

  const {
    id: contactId,
    name,
    pledgeAmount,
    pledgeCurrency,
    pledgeFrequency,
    pledges,
    donations,
  } = contact;

  useEffect(() => {
    if (
      appealStatus === AppealStatusEnum.Asked ||
      appealStatus === AppealStatusEnum.Excluded
    ) {
      const { amount, date } = formatPledgeOrDonation({
        amount: pledgeAmount,
        currency: pledgeCurrency,
        appealStatus,
        date: pledgeFrequency,
        locale,
        t,
      });
      setAmountAndFrequency(`${amount} ${date}`);
    } else if (
      appealStatus === AppealStatusEnum.NotReceived ||
      appealStatus === AppealStatusEnum.ReceivedNotProcessed
    ) {
      const appealPledge = pledges?.find(
        (pledge) => pledge.appeal.id === appealId,
      );

      if (appealPledge) {
        const { amount, date } = formatPledgeOrDonation({
          amount: appealPledge?.amount,
          currency: appealPledge.amountCurrency,
          appealStatus,
          date: appealPledge.expectedDate,
          locale,
          t,
        });

        setAmountAndFrequency(`${amount} (${date})`);
      } else {
        setAmountAndFrequency(`${currencyFormat(0, 'USD', locale)}`);
      }
    } else if (appealStatus === AppealStatusEnum.Processed) {
      const appealPledge = pledges?.find(
        (pledge) => pledge.appeal.id === appealId,
      );

      if (appealPledge) {
        const { amount } = formatPledgeOrDonation({
          amount: appealPledge?.amount,
          currency: appealPledge.amountCurrency,
          appealStatus,
          locale,
          t,
        });
        setAmountAndFrequency(`${amount}`);
      } else {
        setAmountAndFrequency(`${currencyFormat(0, 'USD', locale)}`);
      }

      // Currently we grab all the donations and filter them by the appeal id
      // We need a query that allows us to filter by the appeal id
      // Maybe buy the backend team some donuts and ask them to add a filter to the donations query
      const appealDonations = donations.nodes.filter(
        (donation) => donation?.appeal?.id === appealId,
      );

      const givenDonations = appealDonations.map((donation) => {
        const donationAmount =
          donation?.appealAmount?.amount &&
          donation?.appealAmount.convertedCurrency
            ? currencyFormat(
                donation.appealAmount.amount,
                donation.appealAmount.convertedCurrency,
                locale,
              )
            : donation?.appealAmount?.amount ||
              currencyFormat(
                0,
                donation?.appealAmount?.convertedCurrency,
                locale,
              );

        const donationDate = dateFormat(
          DateTime.fromISO(donation.donationDate),
          locale,
        );

        return `(${donationAmount}) (${donationDate})`;
      });

      setPledgeDonations(givenDonations);
    }
  }, [appealStatus, pledgeAmount, pledgeCurrency, locale]);

  const handleCreatePledge = () => {
    setPledgeModalType(PledgeModalEnum.Create);
    setPledgeValues(undefined);
    setPledgeModalOpen(true);
  };

  const handleEditContact = () => {
    setPledgeModalType(PledgeModalEnum.Edit);
    setPledgeModalOpen(true);
    // TODO after API fixed
    setPledgeValues({
      contactId: contactId,
      amount: pledgeAmount ?? 0,
      currency: pledgeCurrency ?? '',
      expectedDate: contact.pledgeStartDate ?? '',
      status: '',
    });
  };

  const handleRemoveContactFromAppeal = () => {
    setRemoveContactModalOpen(true);
  };

  const handleAddExcludedContactToAppeal = () => {
    setAddExcludedContactModalOpen(true);
  };

  const handleRemovePledge = () => {
    setDeletePledgeModalOpen(true);
    // TODO after API fixed
    setPledgeValues({
      contactId: contactId,
      amount: pledgeAmount ?? 0,
      currency: pledgeCurrency ?? '',
      expectedDate: contact.pledgeStartDate ?? '',
      status: '',
    });
  };

  const isExcludedContact = appealStatus === AppealStatusEnum.Excluded;

  return (
    <>
      <ListButton
        focusRipple
        onClick={handleContactClick}
        onMouseEnter={preloadContactsRightPanel}
        useTopMargin={useTopMargin}
        isChecked={isChecked}
        contactId={contactId}
        data-testid="rowButton"
      >
        <Hidden xsDown>
          <ListItemIcon>
            <StyledCheckbox
              checked={isChecked(contact.id)}
              color="secondary"
              onClick={(event) => event.stopPropagation()}
              onChange={() => onContactCheckToggle(contact.id)}
              value={isChecked}
            />
          </ListItemIcon>
        </Hidden>
        <Grid container alignItems="center">
          <Grid
            item
            xs={isExcludedContact ? 5 : 6}
            style={{ paddingRight: 16 }}
          >
            <ListItemText
              primary={
                <Typography component="span" variant="h6" noWrap>
                  <Box component="span" display="flex" alignItems="center">
                    {name}
                  </Box>
                </Typography>
              }
            />
          </Grid>
          {isExcludedContact && (
            <Grid item xs={3} display={'flex'}>
              <Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                >
                  <Typography component="span">
                    {/* TODO */}
                    Reason
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
          <Grid
            item
            xs={isExcludedContact ? 4 : 6}
            display={'flex'}
            style={{ justifyContent: 'space-between' }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent={contactDetailsOpen ? 'flex-end' : undefined}
            >
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
              >
                {appealStatus !== AppealStatusEnum.Processed && (
                  <Typography component="span">{amountAndFrequency}</Typography>
                )}

                {appealStatus === AppealStatusEnum.Processed &&
                  pledgeDonations?.map((donation, idx) => (
                    <Typography key={`${donation}-${idx}`} component="span">
                      {amountAndFrequency} {donation}
                    </Typography>
                  ))}
              </Box>
            </Box>

            <ContactRowActions
              display="flex"
              alignItems="center"
              style={{
                paddingRight: theme.spacing(2),
              }}
              className="contactRowActions"
            >
              {appealStatus === AppealStatusEnum.Asked && (
                <>
                  <IconButton
                    size={'small'}
                    component="div"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleCreatePledge();
                    }}
                    onMouseOver={preloadPledgeModal}
                  >
                    <AddIcon />
                  </IconButton>
                  <IconButton
                    size={'small'}
                    component="div"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveContactFromAppeal();
                    }}
                    onMouseOver={preloadDeleteAppealContactModal}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                </>
              )}
              {(appealStatus === AppealStatusEnum.NotReceived ||
                appealStatus === AppealStatusEnum.Processed ||
                appealStatus === AppealStatusEnum.ReceivedNotProcessed) && (
                <>
                  <IconButton
                    size={'small'}
                    component="div"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleEditContact();
                    }}
                    onMouseOver={preloadPledgeModal}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size={'small'}
                    component="div"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemovePledge();
                    }}
                    onMouseOver={preloadDeletePledgeModal}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                </>
              )}
              {appealStatus === AppealStatusEnum.Excluded && (
                <IconButton
                  size={'small'}
                  component="div"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAddExcludedContactToAppeal();
                  }}
                  onMouseOver={preloadAddExcludedContactModal}
                >
                  <AddIcon />
                </IconButton>
              )}
            </ContactRowActions>
          </Grid>
        </Grid>
        <Hidden xsDown>
          <Box></Box>
        </Hidden>
      </ListButton>

      {removeContactModalOpen && (
        <DynamicDeleteAppealContactModal
          contactId={contactId}
          handleClose={() => setRemoveContactModalOpen(false)}
        />
      )}

      {addExcludedContactModalOpen && (
        <DynamicAddExcludedContactModal
          contactIds={[contactId]}
          handleClose={() => setAddExcludedContactModalOpen(false)}
        />
      )}

      {createPledgeModalOpen && (
        <DynamicPledgeModal
          contact={contact}
          handleClose={() => setPledgeModalOpen(false)}
          type={pledgeModalType}
          pledge={pledgeValues}
        />
      )}

      {deletePledgeModalOpen && pledgeValues && (
        <DynamicDeletePledgeModal
          pledge={pledgeValues}
          handleClose={() => setDeletePledgeModalOpen(false)}
        />
      )}
    </>
  );
};
