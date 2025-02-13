import React from 'react';
import { Alert, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { CoachAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { StyledFormLabel } from 'src/components/Shared/Forms/Field';
import { InviteTypeEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { ManageAccounts } from '../../Accounts/ManageAccounts/ManageAccounts';
import { SharedAccountUserFragment } from '../../Accounts/ManageAccounts/ManageAccounts.generated';
import { AccordionProps } from '../../accordionHelper';
import {
  useDeleteAccountListCoachMutation,
  useGetAccountListCoachesQuery,
} from './ManageAccountAccess.generated';

export const ManageCoachesAccessAccordion: React.FC<
  AccordionProps<CoachAccordion>
> = ({ handleAccordionChange, expandedAccordion }) => {
  const { t } = useTranslation();
  const accordionName = t('Manage Account Coaching Access');
  const { enqueueSnackbar } = useSnackbar();
  const accountListId = useAccountListId() || '';
  const { appName } = useGetAppSettings();

  const { data: accountListCoaches, loading: loadingCoaches } =
    useGetAccountListCoachesQuery({
      variables: {
        accountListId,
      },
    });
  const [deleteAccountListCoach] = useDeleteAccountListCoachMutation();

  const coaches = accountListCoaches?.accountListCoaches.nodes ?? [];

  const handleRemoveCoach = async (coach: SharedAccountUserFragment) => {
    await deleteAccountListCoach({
      variables: {
        input: {
          accountListId,
          coachId: coach.id,
        },
      },
      update: (cache) => {
        cache.evict({ id: `UserScopedToAccountList:${coach.id}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(
          t('{{appName}} removed the coach successfully', { appName }),
          {
            variant: 'success',
          },
        );
      },
      onError: () => {
        enqueueSnackbar(
          t("{{appName}} couldn't remove the coach", { appName }),
          {
            variant: 'error',
          },
        );
      },
    });
  };

  return (
    <AccordionItem
      accordion={CoachAccordion.ManageCoachesAccess}
      onAccordionChange={handleAccordionChange}
      expandedAccordion={expandedAccordion}
      label={accordionName}
      value={''}
      fullWidth={true}
    >
      <StyledFormLabel>{accordionName}</StyledFormLabel>

      <ManageAccounts
        type={InviteTypeEnum.Coach}
        intro={
          <>
            <Typography>
              {t('Share this ministry account with other team members')}
            </Typography>
            <Alert severity="warning" style={{ marginTop: '15px' }}>
              {t(
                `If you want to allow another {{appName}} coach to have coaching access to this ministry account, you can share access with
            them. Make sure you have the proper permissions and leadership consensus around this sharing before you do this. You
            will be able to remove coaching access later.`,
                { appName },
              )}
            </Alert>
          </>
        }
        loading={loadingCoaches}
        accountsSharingWith={coaches}
        handleRemoveAccount={handleRemoveCoach}
      />
    </AccordionItem>
  );
};
