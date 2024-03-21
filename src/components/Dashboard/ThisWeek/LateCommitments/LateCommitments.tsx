import { useRouter } from 'next/router';
import React, { ReactElement } from 'react';
import {
  Button,
  CardActions,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Skeleton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  Contact,
  ContactConnection,
  ContactFilterPledgeReceivedEnum,
  Scalars,
  StatusEnum,
} from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { numberFormat } from 'src/lib/intlFormat';
import illustration14 from '../../../../images/drawkit/grape/drawkit-grape-pack-illustration-14.svg';
import AnimatedCard from '../../../AnimatedCard';
import { GetThisWeekQuery } from '../GetThisWeek.generated';

const LateCommitmentsContainer = styled(AnimatedCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '322px',
  [theme.breakpoints.down('xs')]: {
    height: 'auto',
  },
}));

const MotionDiv = styled(motion.div)(() => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
}));

const CardList = styled(List)(() => ({
  flex: 1,
  padding: 0,
  overflow: 'auto',
}));

const LateCommitmentsCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  '& > img': {
    height: '150px',
    marginBottom: theme.spacing(2),
  },
}));

interface Props {
  loading?: boolean;
  latePledgeContacts?: GetThisWeekQuery['latePledgeContacts'];
}

const LateCommitments = ({
  loading,
  latePledgeContacts,
}: Props): ReactElement => {
  const { t } = useTranslation();
  const locale = useLocale();
  const accountListId = useAccountListId();
  const { push } = useRouter();

  const showLateCommitments = (latePledgeContacts?: ContactConnection) => {
    if (!latePledgeContacts || latePledgeContacts.nodes.length === 0) {
      return false;
    }
    const filteredLatePledges = latePledgeContacts.nodes.filter(
      (contact: Contact) => {
        if (contact.lateAt) {
          return determineDaysLate(contact.lateAt) >= 7;
        }
        return false;
      },
    );
    return filteredLatePledges.length > 0;
  };

  const determineDaysLate = (lateAt: Scalars['ISO8601Date']) => {
    return Math.round(
      DateTime.local().diff(DateTime.fromISO(lateAt), 'days').days,
    );
  };

  return (
    <LateCommitmentsContainer>
      <CardHeader title={t('Late Commitments')} />
      {loading && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-testid="LateCommitmentsDivLoading"
        >
          <CardList>
            {[0, 1, 2].map((index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={<Skeleton variant="text" width={100} />}
                  secondary={<Skeleton variant="text" width={200} />}
                />
              </ListItem>
            ))}
          </CardList>
          <CardActions>
            <Button size="small" color="primary" disabled>
              {t('View All ({{totalCount}})', { totalCount: 0 })}
            </Button>
          </CardActions>
        </MotionDiv>
      )}
      {!loading && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {!showLateCommitments(latePledgeContacts as ContactConnection) && (
            <LateCommitmentsCardContent data-testid="LateCommitmentsCardContentEmpty">
              <img src={illustration14} alt="empty" />
              {t('No late commitments to show.')}
            </LateCommitmentsCardContent>
          )}
          {latePledgeContacts &&
            showLateCommitments(latePledgeContacts as ContactConnection) && (
              <>
                <CardList data-testid="LateCommitmentsListContacts">
                  {latePledgeContacts.nodes.map((contact) => {
                    if (!contact.lateAt) {
                      return null;
                    }
                    const daysLate = Math.round(
                      DateTime.local().diff(
                        DateTime.fromISO(contact.lateAt),
                        'days',
                      ).days,
                    );

                    return (
                      daysLate >= 7 && (
                        <ListItem
                          component="a"
                          button
                          data-testid={`LateCommitmentsListItemContact-${contact.id}`}
                          onClick={() =>
                            push(
                              `/accountLists/${accountListId}/contacts/list/${contact.id}`,
                            )
                          }
                          key={contact.id}
                        >
                          <ListItemText
                            primary={contact.name}
                            secondary={t(
                              'Their gift is {{daysLate}} day late._plural',
                              {
                                daysLate: numberFormat(daysLate, locale),
                              },
                            )}
                          />
                        </ListItem>
                      )
                    );
                  })}
                </CardList>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    data-testid="LateCommitmentsButtonViewAll"
                    href={`/accountLists/${accountListId}/contacts/list?filters=${encodeURIComponent(
                      JSON.stringify({
                        lateAt: {
                          min: DateTime.fromISO('1970-01-01'),
                          max: DateTime.local()
                            .endOf('day')
                            .minus({ days: 30 })
                            .toISODate(),
                        },
                        pledgeReceived:
                          ContactFilterPledgeReceivedEnum.Received,
                        status: [StatusEnum.PartnerFinancial],
                      }),
                    )}`}
                  >
                    {t('View All ({{totalCount}})', {
                      totalCount: numberFormat(
                        latePledgeContacts?.totalCount ?? 0,
                        locale,
                      ),
                    })}
                  </Button>
                </CardActions>
              </>
            )}
        </MotionDiv>
      )}
    </LateCommitmentsContainer>
  );
};

export default LateCommitments;
