import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
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
          label={t("Change the contact's status to: {{status}}", {
            status: partnerStatus.suggestedContactStatus,
          })}
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
