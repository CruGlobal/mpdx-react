import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
} from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';
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
  const { t } = useTranslation();

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
                status:
                  contactPartnershipStatus[partnerStatus.suggestedContactStatus]
                    ?.translated,
              }}
              components={{ italic: <i />, bold: <strong /> }}
            />
          }
        />
        {numOfContacts > 1 && (
          <FormHelperText>
            {t('This will change the contact status for {{amount}} contacts', {
              amount: numOfContacts,
            })}
          </FormHelperText>
        )}
      </FormControl>
    </Grid>
  ) : null;
};
