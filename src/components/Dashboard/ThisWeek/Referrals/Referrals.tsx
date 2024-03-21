import { useRouter } from 'next/router';
import React, { ReactElement, useState } from 'react';
import {
  Button,
  CardActions,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Skeleton,
  Tab,
  Tabs,
  Theme,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { StatusEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { numberFormat } from 'src/lib/intlFormat';
import illustration4 from '../../../../images/drawkit/grape/drawkit-grape-pack-illustration-4.svg';
import AnimatedCard from '../../../AnimatedCard';
import { GetThisWeekQuery } from '../GetThisWeek.generated';

const useStyles = makeStyles()((theme: Theme) => ({
  div: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  list: {
    flex: 1,
    padding: 0,
    overflow: 'auto',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '322px',
    [theme.breakpoints.down('xs')]: {
      height: 'auto',
    },
  },
  cardContent: {
    padding: theme.spacing(2),
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    height: '120px',
    marginBottom: 0,
    [theme.breakpoints.down('xs')]: {
      height: '150px',
      marginBottom: theme.spacing(2),
    },
  },
}));

interface ReferralsTabProps {
  loading: boolean;
  referrals?:
    | GetThisWeekQuery['onHandReferrals']
    | GetThisWeekQuery['recentReferrals'];
  tab: 'Recent' | 'OnHand';
}

const ReferralsTab = ({
  loading,
  referrals,
  tab,
}: ReferralsTabProps): ReactElement => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { push } = useRouter();

  return (
    <>
      {loading && (
        <>
          <List
            className={classes.list}
            data-testid={`ReferralsTab${tab}ListLoading`}
          >
            {[0, 1].map((index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={<Skeleton variant="text" width={100} />}
                  secondary={<Skeleton variant="text" width={200} />}
                />
                <ListItemSecondaryAction>
                  <Skeleton variant="rectangular" width={20} height={20} />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <CardActions>
            <Button size="small" color="primary" disabled>
              {t('View All ({{totalCount}})', { totalCount: 0 })}
            </Button>
          </CardActions>
        </>
      )}
      {!loading &&
        (!referrals || referrals.nodes.length === 0 ? (
          <CardContent
            className={classes.cardContent}
            data-testid={`ReferralsTab${tab}CardContentEmpty`}
          >
            <img src={illustration4} className={classes.img} alt="empty" />
            {t('No referrals to show.')}
          </CardContent>
        ) : (
          <>
            <List
              className={classes.list}
              data-testid={`ReferralsTab${tab}List`}
            >
              {referrals.nodes.map((contact) => (
                <ListItem
                  component="a"
                  button
                  data-testid={`ReferralsTab${tab}ListItem-${contact.id}`}
                  key={contact.id}
                  onClick={() =>
                    push(
                      `/accountLists/${accountListId}/contacts/list/${contact.id}`,
                    )
                  }
                >
                  <ListItemText
                    disableTypography={true}
                    primary={
                      <Typography variant="body1">{contact.name}</Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <CardActions>
              <Button
                size="small"
                color="primary"
                href={`/accountLists/${accountListId}/contacts/list?filters=${encodeURIComponent(
                  JSON.stringify(
                    tab === 'Recent'
                      ? {
                          createdAt: {
                            min: DateTime.local()
                              .endOf('day')
                              .minus({ weeks: 2 })
                              .toISODate(),
                            max: DateTime.local().toISODate(),
                          },
                          referrer: ['any'],
                        }
                      : {
                          referrer: ['any'],
                          status: [
                            StatusEnum.NeverContacted,
                            StatusEnum.AskInFuture,
                            StatusEnum.CultivateRelationship,
                            StatusEnum.ContactForAppointment,
                          ],
                        },
                  ),
                )}`}
              >
                {t('View All ({{totalCount}})', {
                  totalCount: referrals.totalCount,
                })}
              </Button>
            </CardActions>
          </>
        ))}
    </>
  );
};

interface Props {
  loading: boolean;
  recentReferrals?: GetThisWeekQuery['recentReferrals'];
  onHandReferrals?: GetThisWeekQuery['onHandReferrals'];
}

const Referrals = ({
  loading,
  recentReferrals,
  onHandReferrals,
}: Props): ReactElement => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const locale = useLocale();
  const [value, setValue] = useState(0);

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: number,
  ): void => {
    setValue(newValue);
  };

  return (
    <AnimatedCard className={classes.card}>
      <CardHeader title={t('Referrals')} />
      <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        onChange={handleChange}
      >
        <Tab
          label={t('Recent ({{totalCount}})', {
            totalCount: numberFormat(recentReferrals?.totalCount || 0, locale),
          })}
          data-testid="ReferralsTabRecent"
        />
        <Tab
          label={t('On Hand ({{totalCount}})', {
            totalCount: numberFormat(onHandReferrals?.totalCount || 0, locale),
          })}
          data-testid="ReferralsTabOnHand"
        />
      </Tabs>
      {value === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={classes.div}
          data-testid="ReferralsDivRecent"
        >
          <ReferralsTab
            loading={loading}
            referrals={recentReferrals}
            tab="Recent"
          />
        </motion.div>
      )}
      {value === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={classes.div}
          data-testid="ReferralsDivOnHand"
        >
          <ReferralsTab
            loading={loading}
            referrals={onHandReferrals}
            tab="OnHand"
          />
        </motion.div>
      )}
    </AnimatedCard>
  );
};

export default Referrals;
