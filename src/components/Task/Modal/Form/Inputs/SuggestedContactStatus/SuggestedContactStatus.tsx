import { Checkbox, FormControl, FormControlLabel, Grid } from '@mui/material';
import { Trans } from 'react-i18next';
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
  numOfContacts: number;
  changeContactStatus?: boolean;
}

export const SuggestedContactStatus: React.FC<SuggestedContactStatusProps> = ({
  partnerStatus,
  handleChange,
  numOfContacts,
  changeContactStatus,
}) => {
  if (numOfContacts > 1) {
    return null;
  }

  return partnerStatus?.suggestedContactStatus ? (
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
                status: partnerStatus.suggestedContactStatus,
              }}
              components={{ italic: <i />, bold: <strong /> }}
            />
          }
        />
      </FormControl>
    </Grid>
  ) : null;
};
