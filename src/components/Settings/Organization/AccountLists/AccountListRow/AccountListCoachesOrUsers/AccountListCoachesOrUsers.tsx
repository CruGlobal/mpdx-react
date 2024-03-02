import React, { Dispatch, SetStateAction } from 'react';
import {
  DeleteForever,
  HelpOutline as HelpOutlineIcon,
  PersonRemove,
} from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import { Box, IconButton, Link, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import * as Types from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { BorderBottomBox, HeaderBox } from '../AccountListRow';

const dateTimeFormat = (date: DateTime | null, locale: string): string => {
  if (date === null) {
    return '';
  }
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  }).format(date.toJSDate());
};

export type UserOrCoach =
  | Types.AccountListUsers
  | Types.OrganizationAccountListCoaches;

export type UserState = { item: Types.AccountListUsers; dialogOpen: boolean };

interface Props {
  accountListItems: Array<Types.Maybe<UserOrCoach>>;
  setDeleteUserDialogOpen: Dispatch<SetStateAction<boolean>>;
  setRemoveCoachDialogOpen: Dispatch<SetStateAction<boolean>>;
  setRemoveUser: Dispatch<SetStateAction<UserState>>;
  setDeleteUserContent: Dispatch<SetStateAction<Types.AccountListUsers>>;
  setRemoveCoachContent: Dispatch<
    SetStateAction<Types.OrganizationAccountListCoaches>
  >;
}

const ContactAddressPrimaryText = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(0, 0.5),
  color: theme.palette.text.secondary,
}));

export const AccountListCoachesOrUsers: React.FC<Props> = ({
  accountListItems,
  setRemoveCoachDialogOpen,
  setDeleteUserDialogOpen,
  setDeleteUserContent,
  setRemoveUser,
  setRemoveCoachContent,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

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
              <HeaderBox>
                {item.__typename === 'AccountListUsers' &&
                  `${item.userFirstName} ${item.userLastName}`}
                {item.__typename === 'OrganizationAccountListCoaches' &&
                  `${item.coachFirstName} ${item.coachLastName}`}
                {item.__typename === 'AccountListUsers' && (
                  <Tooltip
                    title={t('Permanently delete this user.')}
                    placement={'top'}
                    arrow
                    data-testid="DeleteUserButton"
                  >
                    <IconButton
                      aria-label={t('Delete')}
                      color="error"
                      size="small"
                      onClick={() => {
                        setDeleteUserContent(item);
                        setDeleteUserDialogOpen(true);
                      }}
                    >
                      <DeleteForever fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </HeaderBox>
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
                          sx={{ fontWeight: 'regular' }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Link
                            underline="hover"
                            href={`mailto:${email?.email}`}
                          >
                            {email?.email}
                          </Link>
                          {email?.primary && (
                            <ContactAddressPrimaryText data-testid="ContactAddressPrimaryText">
                              <CheckIcon color="success" fontSize="small" />
                            </ContactAddressPrimaryText>
                          )}
                        </Box>
                      );
                    })}
                </Box>
                <Box style={{ textAlign: 'right' }}>
                  {item.__typename === 'AccountListUsers' &&
                    !item.allowDeletion && (
                      <Tooltip
                        title={t(
                          'User has been granted access to this account list by donation services. Last synced: {{date}}',
                          {
                            date:
                              item?.lastSyncedAt &&
                              dateTimeFormat(
                                DateTime.fromISO(item?.lastSyncedAt),
                                locale,
                              ),
                          },
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
                  {item.__typename === 'AccountListUsers' && (
                    <Tooltip
                      title={t('Remove this user from the account.')}
                      placement={'top'}
                      arrow
                      data-testid="RemoveUserButton"
                    >
                      <IconButton
                        aria-label={t('Remove')}
                        color="error"
                        size="small"
                        onClick={() => {
                          setRemoveUser({
                            item: item,
                            dialogOpen: true,
                          });
                        }}
                      >
                        <PersonRemove fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                {item.__typename === 'OrganizationAccountListCoaches' && (
                  <Tooltip
                    title={t('Remove this coach from the account.')}
                    placement={'top'}
                    arrow
                    data-testid="RemoveCoachButton"
                  >
                    <IconButton
                      aria-label={t('Remove')}
                      color="error"
                      onClick={() => {
                        setRemoveCoachContent(item);
                        setRemoveCoachDialogOpen(true);
                      }}
                      size="small"
                    >
                      <PersonRemove fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Typography>
          </BorderBottomBox>
        );
      })}
    </>
  );
};
