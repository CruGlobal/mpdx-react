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
import clsx from 'clsx';
import { TFunction } from 'i18next';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  ListItemButton,
  StyledCheckbox,
} from 'src/components/Contacts/ContactRow/ContactRow';
import { preloadContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { PledgeFrequencyEnum } from 'src/graphql/types.generated';
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
import { ExcludedAppealContactInfoFragment } from '../../Shared/AppealExcludedContacts.generated';
import { useGetExcludedReasons } from '../../Shared/useGetExcludedReasons/useGetExcludedReasons';

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
  display: 'flex',
  alignItems: 'center',
  paddingRight: theme.spacing(2),
}));

type FormatPledgeOrDonationProps = {
  amount?: number | null;
  currency?: string | null;
  appealStatus: AppealStatusEnum;
  dateOrFrequency?: PledgeFrequencyEnum | string | null;
  locale: string;
  t: TFunction;
};

const formatPledgeOrDonation = ({
  amount,
  currency,
  appealStatus,
  dateOrFrequency,
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
      ? (dateOrFrequency &&
          getLocalizedPledgeFrequency(
            t,
            dateOrFrequency as PledgeFrequencyEnum,
          )) ??
        ''
      : dateOrFrequency
      ? dateFormat(DateTime.fromISO(dateOrFrequency), locale)
      : null;
  return {
    amount: pledgeOrDonationAmount,
    dateOrFrequency: pledgeOrDonationDate,
  };
};

interface Props {
  contact: AppealContactInfoFragment;
  appealStatus: AppealStatusEnum;
  useTopMargin?: boolean;
  excludedContacts: ExcludedAppealContactInfoFragment[];
}

export const ContactRow: React.FC<Props> = ({
  contact,
  appealStatus,
  useTopMargin,
  excludedContacts,
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
  const [pledgeValues, setPledgeValues] =
    useState<AppealContactInfoFragment['pledges'][0]>();
  const [amountAndFrequency, setAmountAndFrequency] = useState<string>();
  const [pledgeDonations, setPledgeDonations] = useState<string[] | null>(null);

  const reasons = useGetExcludedReasons(excludedContacts, contact.id);

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
      const { amount, dateOrFrequency } = formatPledgeOrDonation({
        amount: pledgeAmount,
        currency: pledgeCurrency,
        appealStatus,
        dateOrFrequency: pledgeFrequency,
        locale,
        t,
      });
      setAmountAndFrequency(`${amount} ${dateOrFrequency}`);
      setPledgeValues(undefined);
    } else if (
      appealStatus === AppealStatusEnum.NotReceived ||
      appealStatus === AppealStatusEnum.ReceivedNotProcessed
    ) {
      const appealPledge = pledges?.find(
        (pledge) => pledge.appeal.id === appealId,
      );

      if (appealPledge) {
        const { amount, dateOrFrequency } = formatPledgeOrDonation({
          amount: appealPledge?.amount,
          currency: appealPledge.amountCurrency,
          appealStatus,
          dateOrFrequency: appealPledge.expectedDate,
          locale,
          t,
        });

        setPledgeValues(appealPledge);
        setAmountAndFrequency(`${amount} (${dateOrFrequency})`);
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
        setPledgeValues(appealPledge);
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
        const amount = donation?.appealAmount?.amount;
        const currency = donation?.appealAmount?.convertedCurrency;
        const donationAmount = currencyFormat(
          amount && currency ? amount : 0,
          currency,
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
  }, [appealStatus, contact, locale]);

  const handleCreatePledge = () => {
    setPledgeModalOpen(true);
  };

  const handleEditContact = () => {
    setPledgeModalOpen(true);
  };

  const handleRemoveContactFromAppeal = () => {
    setRemoveContactModalOpen(true);
  };

  const handleAddExcludedContactToAppeal = () => {
    setAddExcludedContactModalOpen(true);
  };

  const handleRemovePledge = () => {
    setDeletePledgeModalOpen(true);
  };

  const isExcludedContact = appealStatus === AppealStatusEnum.Excluded;

  return (
    <>
      <ListButton
        focusRipple
        onClick={handleContactClick}
        onMouseEnter={preloadContactsRightPanel}
        className={clsx({
          'top-margin': useTopMargin,
          checked: isChecked(contactId),
        })}
        data-testid="rowButton"
      >
        <Grid container alignItems="center">
          <Grid
            item
            xs={isExcludedContact ? 5 : 6}
            style={{ paddingRight: 16 }}
            display={'flex'}
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
                  {reasons.map((reason, idx) => (
                    <Typography
                      key={`${contactId}-${reason}-${idx}`}
                      component="span"
                    >
                      {reason}
                    </Typography>
                  ))}
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
