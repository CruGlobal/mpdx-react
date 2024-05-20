import { useMemo } from 'react';
import { Checkbox, FormControl, FormControlLabel, Grid } from '@mui/material';
import { Trans } from 'react-i18next';
import { PhaseEnum, StatusEnum } from 'src/graphql/types.generated';
import { useContactPartnershipStatuses } from 'src/hooks/useContactPartnershipStatuses';
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
    skip: !!contactStatus || contactIds.length !== 1,
  });

  const { statusArray, contactPartnershipStatus } =
    useContactPartnershipStatuses();

  const currentContactStatus = useMemo(() => {
    return contactStatus || data?.contact.status;
  }, [data, contactStatus]);

  const shouldRenderContactSuggestion = useMemo(() => {
    if (!currentContactStatus) {
      return false;
    }
    if (suggestedContactStatus === currentContactStatus) {
      return false;
    }
    const disabledStatuses = statusArray
      .filter((status) => status?.phase === PhaseEnum.PartnerCare)
      .map((s) => s.id);
    return !disabledStatuses.includes(currentContactStatus);
  }, [statusArray, currentContactStatus]);

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
                status:
                  contactPartnershipStatus[suggestedContactStatus]?.translated,
              }}
              components={{ italic: <i />, bold: <strong /> }}
            />
          }
        />
      </FormControl>
    </Grid>
  ) : null;
};
