import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Alert, Typography } from '@mui/material';
import { useAccountListId } from 'src/hooks/useAccountListId';
import {
  useGetAccountListCoachesQuery,
  useDeleteAccountListCoachMutation,
} from './ManageAccountAccess.generated';
import * as Types from '../../../../../graphql/types.generated';
import { StyledFormLabel } from 'src/components/Shared/Forms/Field';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import {
  ManageAccounts,
  Coach,
} from '../../Accounts/ManageAccounts/ManageAccounts';
import { AccordianProps } from '../../accordianHelper';

export const ManageCoachesAccessAccordian: React.FC<AccordianProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const accordianName = t('Manage Account Coaching Access');
  const { enqueueSnackbar } = useSnackbar();
  const accountListId = useAccountListId() || '';

  const { data: accountListCoaches, loading: loadingCoaches } =
    useGetAccountListCoachesQuery({
      variables: {
        accountListId,
      },
    });
  const [deleteAccountListCoach] = useDeleteAccountListCoachMutation();

  const coaches = accountListCoaches?.accountListCoaches.nodes;

  const handleRemoveCoach = async (coach: Coach) => {
    await deleteAccountListCoach({
      variables: {
        input: {
          id: coach.id,
        },
      },
      update: (cache) => {
        cache.evict({ id: `AccountListCoach:${coach.id}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(t('MPDX removed the coach successfully'), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(t("MPDX couldn't remove the coach"), {
          variant: 'error',
        });
      },
    });
  };

  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={accordianName}
      value={''}
      fullWidth={true}
    >
      <StyledFormLabel>{accordianName}</StyledFormLabel>

      <ManageAccounts
        type={Types.InviteTypeEnum.Coach}
        intro={
          <>
            <Typography>
              {t('Share this ministry account with other team members')}
            </Typography>
            <Alert severity="warning" style={{ marginTop: '15px' }}>
              {t(`If you want to allow another mpdx coach to have coaching access to this ministry account, you can share access with
            them. Make sure you have the proper permissions and leadership consensus around this sharing before you do this. You
            will be able to remove coaching access later.`)}
            </Alert>
          </>
        }
        loadingItems={loadingCoaches}
        items={coaches || []}
        handleRemoveItem={handleRemoveCoach}
      />
    </AccordionItem>
  );
};
