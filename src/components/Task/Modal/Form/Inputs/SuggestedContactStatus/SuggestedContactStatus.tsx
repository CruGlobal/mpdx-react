import { useMemo } from 'react';
import { Checkbox, FormControl, FormControlLabel, Grid } from '@mui/material';
import { Trans } from 'react-i18next';
import { PhaseEnum, StatusEnum } from 'src/graphql/types.generated';
import { useContactPartnershipStatuses } from 'src/hooks/useContactPartnershipStatuses';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import { useContactStatusQuery } from './SuggestedContactStatus.generated';

export type FormikHandleChange = {
  (e: React.ChangeEvent<unknown>): void;
  <T = string | React.ChangeEvent<unknown>>(
    field: T,
  ): T extends React.ChangeEvent<unknown>
    ? void
    : (e: string | React.ChangeEvent<unknown>) => void;
};

interface SuggestedContactStatusProps {
  suggestedContactStatus: StatusEnum | undefined;
  handleChange: FormikHandleChange;
  contactIds: string[] | undefined;
  accountListId: string;
  changeContactStatus?: boolean;
  contactStatus?: StatusEnum | null;
}

export const SuggestedContactStatus: React.FC<SuggestedContactStatusProps> = ({
  suggestedContactStatus,
  handleChange,
  contactIds,
  accountListId,
  changeContactStatus,
  contactStatus,
}) => {
  if (!contactIds || contactIds.length !== 1) {
    return null;
  }
  const contactId = contactIds[0];
  const { data } = useContactStatusQuery({
    variables: {
      accountListId,
      contactId,
    },
    skip: !!contactStatus,
  });

  const { getLocalizedContactStatus } = useLocalizedConstants();
  const { getContactStatusesByPhase } = useContactPartnershipStatuses();

  const currentContactStatus: StatusEnum | null | undefined =
    contactStatus || data?.contact.status;

  const shouldRenderContactSuggestion: boolean = useMemo(() => {
    // Hide suggestedStatus if the suggested status is the current status
    if (suggestedContactStatus === currentContactStatus) {
      return false;
    }

    if (currentContactStatus) {
      const disabledStatuses: StatusEnum[] = getContactStatusesByPhase(
        PhaseEnum.PartnerCare,
      );
      // Hide suggestedStatus if the suggested status is a partner care status, otherwise, show it
      return !disabledStatuses.includes(currentContactStatus);
    }
    // Show suggestedStatus if the contact has no status
    return true;
  }, [currentContactStatus]);

  return suggestedContactStatus && shouldRenderContactSuggestion ? (
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
                status: getLocalizedContactStatus(suggestedContactStatus),
              }}
              components={{ bold: <strong /> }}
            />
          }
        />
      </FormControl>
    </Grid>
  ) : null;
};
