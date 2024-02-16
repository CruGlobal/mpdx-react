import Link from 'next/link';
import React, { useState } from 'react';
import {
  Delete as DeleteIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import * as Types from 'src/graphql/types.generated';
import theme from 'src/theme';

export enum AccountListItemType {
  COACH = 'coach',
  USER = 'user',
}

type UserOrCoach =
  | Types.AccountListUsers
  | Types.OrganizationAccountListCoaches;

interface Props {
  name: string;
  accountListItems: Array<Types.Maybe<UserOrCoach>>;
  type: AccountListItemType;
  handleDelete: (item: UserOrCoach, type: AccountListItemType) => Promise<void>;
}

const BorderBottomBox = styled(Box)(() => ({
  borderBottom: '1px solid',
  borderColor: theme.palette.cruGrayLight.main,
}));

const ContactAddressPrimaryText = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  color: theme.palette.text.secondary,
}));

export const AccountListCoachesOrUsers: React.FC<Props> = ({
  name,
  accountListItems,
  type,
  handleDelete,
}) => {
  const { t } = useTranslation();
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);

  return (
    <>
      {!accountListItems?.length && null}

      {accountListItems?.map((item, idx) => {
        if (!item || !item.__typename) {
          return null;
        }

        const emails =
          item.__typename === 'AccountListUsers'
            ? item.userEmailAddresses
            : item.__typename === 'OrganizationAccountListCoaches'
            ? item.coachEmailAddresses
            : [];

        return (
          <BorderBottomBox key={`designationAccounts-coaches-${idx}`}>
            <Typography component="span">
              <Box sx={{ fontWeight: 'bold', m: 1 }}>
                {item.__typename === 'AccountListUsers' &&
                  `${item.userFirstName} ${item.userLastName}`}
                {item.__typename === 'OrganizationAccountListCoaches' &&
                  `${item.coachFirstName} ${item.coachLastName}`}
              </Box>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  {emails &&
                    emails.map((email, idx) => {
                      if (!email?.id) return null;

                      return (
                        <Box
                          key={`email-${email?.id}-${idx}`}
                          sx={{ fontWeight: 'regular', m: 1 }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Link href={`mailto:${email?.email}`}>
                            {email?.email}
                          </Link>
                          {email?.primary && (
                            <ContactAddressPrimaryText data-testid="ContactAddressPrimaryText">
                              - {t('Primary')}
                            </ContactAddressPrimaryText>
                          )}
                        </Box>
                      );
                    })}
                </Box>

                {item.__typename === 'AccountListUsers' && item.allowDeletion && (
                  <IconButton
                    aria-label={t('Delete')}
                    color="error"
                    onClick={() => setDeleteUserDialogOpen(true)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
                {item.__typename === 'AccountListUsers' && !item.allowDeletion && (
                  <Tooltip
                    title={t(
                      'User has been granted access to this account list by donation services',
                    )}
                    placement={'top'}
                    arrow
                    data-testid="InformationButton"
                  >
                    <IconButton
                      aria-label={t('Information')}
                      color="primary"
                      size="small"
                    >
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {item.__typename === 'AccountListUsers' && item.allowDeletion && (
                  <Confirmation
                    isOpen={deleteUserDialogOpen}
                    title={t('Confirm')}
                    message={t(
                      'Are you sure you want to remove {{user}} as a user from {{accountList}}?',
                      {
                        user: item.userFirstName,
                        accountList: name,
                      },
                    )}
                    handleClose={() => setDeleteUserDialogOpen(false)}
                    mutation={() => handleDelete(item, type)}
                  />
                )}

                {item.__typename === 'OrganizationAccountListCoaches' && (
                  <>
                    <IconButton
                      aria-label={t('Delete')}
                      color="error"
                      onClick={() => setDeleteUserDialogOpen(true)}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Confirmation
                      isOpen={deleteUserDialogOpen}
                      title={t('Confirm')}
                      message={t(
                        'Are you sure you want to remove {{coach}} as a coach from {{accountList}}?',
                        {
                          coach: item.coachFirstName,
                          accountList: name,
                        },
                      )}
                      handleClose={() => setDeleteUserDialogOpen(false)}
                      mutation={() => handleDelete(item, type)}
                    />
                  </>
                )}
              </Box>
            </Typography>
          </BorderBottomBox>
        );
      })}
    </>
  );
};
