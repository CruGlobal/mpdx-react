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
import {
  AccountListUsers,
  Maybe,
  OrganizationAccountListCoaches,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { dateTimeFormat } from 'src/lib/intlFormat';
import { BorderBottomBox, HeaderBox } from '../accountListRowHelper';

interface Props {
  accountListItems: Array<
    Maybe<AccountListUsers | OrganizationAccountListCoaches>
  >;
  setRemoveUser: Dispatch<SetStateAction<AccountListUsers | null>>;
  setDeleteUser: Dispatch<SetStateAction<AccountListUsers | null>>;
  setRemoveCoach: Dispatch<
    SetStateAction<OrganizationAccountListCoaches | null>
  >;
}

const ContactAddressPrimaryText = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(0, 0.5),
  color: theme.palette.text.secondary,
}));

export const AccountListCoachesOrUsers: React.FC<Props> = ({
  accountListItems,
  setDeleteUser,
  setRemoveUser,
  setRemoveCoach,
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
                {item.__typename === 'AccountListUsers' &&
                  item.organizationCount === 1 && (
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
                          setDeleteUser(item);
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
                  flexWrap: 'wrap',
                }}
              >
                <Box>
                  {emails &&
                    emails.map((email, idx) => {
                      if (!email?.id) {
                        return null;
                      }

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
                              item.lastSyncedAt &&
                              dateTimeFormat(
                                DateTime.fromISO(item.lastSyncedAt),
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
                        aria-label={t('Remove User')}
                        color="error"
                        size="small"
                        onClick={() => {
                          setRemoveUser(item);
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
                      aria-label={t('Remove Coach')}
                      color="error"
                      onClick={() => {
                        setRemoveCoach(item);
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
