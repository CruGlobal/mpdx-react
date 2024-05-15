import { useMemo } from 'react';
import { Checkbox, FormControl, FormControlLabel, Grid } from '@mui/material';
import { Trans } from 'react-i18next';
import { PhaseEnum } from 'src/graphql/types.generated';
import { useContactPartnershipStatuses } from 'src/hooks/useContactPartnershipStatuses';
import { PossiblePartnerStatus } from '../../PossiblePartnerStatus';
import { useContactStatusQuery } from './SuggestedContactStatus.generated';

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
  contactIds: string[] | undefined;
  accountListId: string;
  changeContactStatus?: boolean;
}

export const SuggestedContactStatus: React.FC<SuggestedContactStatusProps> = ({
  partnerStatus,
  handleChange,
  contactIds,
  accountListId,
  changeContactStatus,
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
    skip: contactIds.length !== 1,
  });

  const { statusArray, contactPartnershipStatus } =
    useContactPartnershipStatuses();

  const shouldRenderContactSuggestion = useMemo(() => {
    if (!data?.contact.status) {
      return false;
    }
    const disabledStatus = statusArray
      .filter((status) => status.phase === PhaseEnum.PartnerCare)
      .map((s) => s.id);

    return !disabledStatus.includes(data.contact.status);
  }, [statusArray, data]);

  return partnerStatus?.suggestedContactStatus &&
    shouldRenderContactSuggestion ? (
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
