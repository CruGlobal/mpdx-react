import { Checkbox, FormControl, FormControlLabel, Grid } from '@mui/material';
import { Trans } from 'react-i18next';
import { Contact, PhaseEnum, StatusEnum } from 'src/graphql/types.generated';
import { useContactPartnershipStatuses } from 'src/hooks/useContactPartnershipStatuses';
import { PossiblePartnerStatus } from '../../PossiblePartnerStatus';

type FormikHandleChange = {
  (e: React.ChangeEvent<unknown>): void;
  <T = string | React.ChangeEvent<unknown>>(
    field: T,
  ): T extends React.ChangeEvent<unknown>
    ? void
    : (e: string | React.ChangeEvent<unknown>) => void;
};

interface SuggestedContactStatusProps {
  partnerStatus: PossiblePartnerStatus | null;
  handleChange: FormikHandleChange;
  contacts: Pick<Contact, 'id' | 'status' | 'name'>[] | undefined;
  changeContactStatus?: boolean;
}

export const SuggestedContactStatus: React.FC<SuggestedContactStatusProps> = ({
  partnerStatus,
  handleChange,
  contacts,
  changeContactStatus,
}) => {
  if (contacts && contacts?.length > 1) {
    return null;
  }

  const { statusArray, contactPartnershipStatus } =
    useContactPartnershipStatuses();

  const showContactSuggestedStatus = (contact): boolean => {
    const singleContact = contact[0] || contact;
    // disabled Statuses are currently set to Partner Statuses in the Partner Care phase: Financial, Special and Prayer Partners.
    const disabledStatus = statusArray
      .filter((status) => status.phase === PhaseEnum.PartnerCare)
      .map((s) => s.id);
    return !disabledStatus.includes(singleContact?.status as StatusEnum);
  };

  return partnerStatus?.suggestedContactStatus &&
    contacts &&
    showContactSuggestedStatus(contacts) ? (
    <Grid item>
      <FormControl fullWidth>
        <FormControlLabel
          control={
            <Checkbox
              checked={changeContactStatus}
              name="changeContactStatus"
              onChange={handleChange}
            />
          }
          label={
            <Trans
              defaults="Change the contact's status to: <bold>{{status}}</bold>" // optional defaultValue
              values={{
                status:
                  contactPartnershipStatus[partnerStatus.suggestedContactStatus]
                    ?.translated,
              }}
              components={{ italic: <i />, bold: <strong /> }}
            />
          }
        />
      </FormControl>
    </Grid>
  ) : null;
};
