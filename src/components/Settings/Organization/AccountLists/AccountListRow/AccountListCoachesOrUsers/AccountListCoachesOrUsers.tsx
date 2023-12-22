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
interface Props {
  name: string;
  accountListItems:
    | Types.Maybe<Types.OrganizationAccountListCoaches>[]
    | Types.Maybe<Types.AccountListUsers>[];
  type: AccountListItemType;
  handleDelete: (
    item: Types.AccountListUsers | Types.OrganizationAccountListCoaches,
    type: AccountListItemType,
  ) => Promise<void>;
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
  const [deleteUserEmailDialogOpen, setDeleteUserEmailDialogOpen] =
    useState(false);

  return (
    <>
      {!accountListItems?.length && null}

      {accountListItems &&
        accountListItems?.map((item, idx) => {
          const emails =
            type === AccountListItemType.USER
              ? item.userEmailAddresses
              : item.coachEmailAddresses;

          return (
            <BorderBottomBox key={`designationAccounts-coachs-${idx}`}>
              <Typography component="span">
                <Box sx={{ fontWeight: 'bold', m: 1 }}>
                  {type === AccountListItemType.USER &&
                    `${item?.userFirstName} ${item?.userLastName}`}
                  {type === AccountListItemType.COACH &&
                    `${item?.coachFirstName} ${item?.coachLastName}`}
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
                        if (!email.id) return null;
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

                  {type === AccountListItemType.USER && item?.allowDeletion && (
                    <IconButton
                      aria-label="Delete"
                      color="error"
                      onClick={() => setDeleteUserEmailDialogOpen(true)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                  {type === AccountListItemType.USER && !item?.allowDeletion && (
                    <Tooltip
                      title={t(
                        'User has been granted access to this account list by donation services',
                      )}
                      placement={'top'}
                      arrow
                      data-testid="InformationButton"
                    >
                      <IconButton
                        aria-label="Information"
                        color="primary"
                        size="small"
                      >
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {type === AccountListItemType.USER && item?.allowDeletion && (
                    <Confirmation
                      isOpen={deleteUserEmailDialogOpen}
                      title={t('Confirm')}
                      message={t(
                        'Are you sure you want to remove {{user}} as a user from {{accountList}}?',
                        {
                          user: item?.userFirstName,
                          accountList: name,
                        },
                      )}
                      handleClose={() => setDeleteUserEmailDialogOpen(false)}
                      mutation={() => handleDelete(item, type)}
                    />
                  )}

                  {type === AccountListItemType.COACH && (
                    <>
                      <IconButton
                        aria-label="delete"
                        color="error"
                        onClick={() => setDeleteUserEmailDialogOpen(true)}
                      >
                        <DeleteIcon />
                      </IconButton>

                      <Confirmation
                        isOpen={deleteUserEmailDialogOpen}
                        title={t('Confirm')}
                        message={t(
                          'Are you sure you want to remove {{coach}} as a coach from {{accountList}}?',
                          {
                            coach: item?.coachFirstName,
                            accountList: name,
                          },
                        )}
                        handleClose={() => setDeleteUserEmailDialogOpen(false)}
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
