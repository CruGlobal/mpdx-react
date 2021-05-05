import React, { ReactElement, useState } from 'react';
import {
  Box,
  Typography,
  CardHeader,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Tabs,
  Tab,
  ListItemIcon,
  CardContent,
  styled,
} from '@material-ui/core';
import CakeIcon from '@material-ui/icons/Cake';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { Skeleton } from '@material-ui/lab';
import { motion } from 'framer-motion';
import uniqBy from 'lodash/fp/uniqBy';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Brightness1Outlined, CheckCircle } from '@material-ui/icons';
import { dayMonthFormat } from '../../../../lib/intlFormat';
import AnimatedCard from '../../../AnimatedCard';
import { useApp } from '../../../App';
import illustration4 from '../../../../images/drawkit/grape/drawkit-grape-pack-illustration-4.svg';
import illustration7 from '../../../../images/drawkit/grape/drawkit-grape-pack-illustration-7.svg';
import { GetThisWeekQuery } from '../GetThisWeek.generated';

const CardContainer = styled(AnimatedCard)(({ theme }) => ({
  flex: 'flex',
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

const CardContentContainer = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',

  '& > img': {
    height: '120px',
    marginBottom: 0,
    [theme.breakpoints.down('xs')]: {
      height: '150px',
      marginBottom: theme.spacing(2),
    },
  },
}));

interface Props {
  accountListId: string;
  loading?: boolean;
  prayerRequestTasks?: GetThisWeekQuery['prayerRequestTasks'];
  reportsPeopleWithBirthdays?: GetThisWeekQuery['reportsPeopleWithBirthdays'];
  reportsPeopleWithAnniversaries?: GetThisWeekQuery['reportsPeopleWithAnniversaries'];
}

const PartnerCare = ({
  accountListId,
  loading,
  prayerRequestTasks,
  reportsPeopleWithBirthdays,
  reportsPeopleWithAnniversaries,
}: Props): ReactElement => {
  const { t } = useTranslation();
  const [value, setValue] = useState(0);
  const { openTaskDrawer } = useApp();

  const handleClick = ({
    id: taskId,
  }: GetThisWeekQuery['prayerRequestTasks']['nodes'][0]): void => {
    openTaskDrawer({ taskId });
  };

  const handleChange = (
    _event: React.ChangeEvent<Record<string, unknown>>,
    newValue: number,
  ): void => {
    setValue(newValue);
  };

  return (
    <CardContainer>
      <CardHeader title={t('Partner Care')} />
      <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        onChange={handleChange}
      >
        <Tab
          label={t('Prayer ({{ totalCount, number }})', {
            totalCount: prayerRequestTasks?.totalCount || 0,
          })}
          data-testid="PartnerCareTabPrayer"
        />
        <Tab
          label={t('Celebrations ({{ totalCount, number }})', {
            totalCount:
              (reportsPeopleWithBirthdays?.periods[0]?.people?.length || 0) +
              (reportsPeopleWithAnniversaries?.periods[0]?.people?.length || 0),
          })}
          data-testid="PartnerCareTabCelebrations"
        />
      </Tabs>
      {value === 0 && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {loading && (
            <>
              <CardList data-testid="PartnerCarePrayerListLoading">
                {[0, 1].map((index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={<Skeleton variant="text" width={100} />}
                      secondary={<Skeleton variant="text" width={200} />}
                    />
                    <ListItemSecondaryAction>
                      <Skeleton variant="rect" width={20} height={20} />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </CardList>
              <CardActions>
                <Button size="small" color="primary" disabled>
                  {t('View All ({{ totalCount, number }})', { totalCount: 0 })}
                </Button>
              </CardActions>
            </>
          )}
          {!loading && (
            <>
              {(!prayerRequestTasks ||
                prayerRequestTasks?.nodes.length === 0) && (
                <CardContentContainer data-testid="PartnerCarePrayerCardContentEmpty">
                  <img
                    src={illustration4}
                    alt="Partner care prayer request empty image"
                  />
                  {t('No prayer requests to show.')}
                </CardContentContainer>
              )}
              {prayerRequestTasks && prayerRequestTasks.nodes.length > 0 && (
                <>
                  <CardList data-testid="PartnerCarePrayerList">
                    {prayerRequestTasks.nodes.map((task) => (
                      <ListItem
                        key={task.id}
                        button
                        data-testid={`PartnerCarePrayerListItem-${task.id}`}
                        onClick={(): void => handleClick(task)}
                      >
                        <ListItemText
                          disableTypography={true}
                          primary={
                            <Typography variant="body1">
                              {task.contacts.nodes
                                .map(({ name }) => name)
                                .join(', ')}
                            </Typography>
                          }
                          secondary={
                            <Box style={{ whiteSpace: 'nowrap' }}>
                              <Box
                                component="div"
                                textOverflow="ellipsis"
                                overflow="hidden"
                              >
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  {task.subject}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                        {/*TODO: This button complete the Prayer Task and remove it from the list: https://jira.cru.org/browse/MPDX-6945 */}
                        <ListItemSecondaryAction>
                          <Checkbox
                            icon={<Brightness1Outlined />}
                            checkedIcon={<CheckCircle />}
                            edge="end"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </CardList>
                  <CardActions>
                    <Link
                      href="/accountLists/[accountListId]/tasks"
                      as={`/accountLists/${accountListId}/tasks?activityType=PRAYER_REQUEST&completed=false`}
                      passHref
                    >
                      <Button size="small" color="primary">
                        {t('View All ({{ totalCount, number }})', {
                          totalCount: prayerRequestTasks.totalCount,
                        })}
                      </Button>
                    </Link>
                  </CardActions>
                </>
              )}
            </>
          )}
        </MotionDiv>
      )}
      {value === 1 && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {loading && (
            <CardList data-testid="PartnerCareCelebrationListLoading">
              {[0, 1, 2].map((index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={<Skeleton variant="text" width={100} />}
                    secondary={<Skeleton variant="text" width={200} />}
                  />
                  <ListItemSecondaryAction>
                    <Skeleton variant="rect" width={20} height={20} />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </CardList>
          )}
          {!loading && (
            <>
              {(!reportsPeopleWithBirthdays ||
                (reportsPeopleWithBirthdays.periods[0].people &&
                  reportsPeopleWithBirthdays.periods[0].people.length === 0)) &&
              (!reportsPeopleWithAnniversaries ||
                (reportsPeopleWithAnniversaries.periods[0].people &&
                  reportsPeopleWithAnniversaries.periods[0].people.length ===
                    0)) ? (
                <CardContentContainer data-testid="PartnerCareCelebrationCardContentEmpty">
                  <img
                    src={illustration7}
                    alt="Partner care celebration empty image"
                  />
                  {t('No celebrations to show.')}
                </CardContentContainer>
              ) : (
                <CardList data-testid="PartnerCareCelebrationList">
                  {reportsPeopleWithBirthdays?.periods[0].people.map(
                    (person) =>
                      person.birthdayDay &&
                      person.birthdayMonth && (
                        <ListItem
                          key={person.id}
                          button
                          data-testid={`PartnerCareBirthdayListItem-${person.id}`}
                        >
                          <ListItemIcon>
                            <CakeIcon />
                          </ListItemIcon>
                          <ListItemText
                            disableTypography={true}
                            primary={
                              <Typography variant="body1">
                                {person.firstName} {person.lastName}
                              </Typography>
                            }
                            secondary={
                              <Box style={{ whiteSpace: 'nowrap' }}>
                                <Box
                                  component="div"
                                  textOverflow="ellipsis"
                                  overflow="hidden"
                                >
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    {dayMonthFormat(
                                      person.birthdayDay,
                                      person.birthdayMonth,
                                    )}
                                  </Typography>
                                </Box>
                              </Box>
                            }
                          />
                          {/*TODO: This button complete the Celebration and remove it from the list: https://jira.cru.org/browse/MPDX-6945 */}
                          <ListItemSecondaryAction>
                            <Checkbox
                              icon={<Brightness1Outlined />}
                              checkedIcon={<CheckCircle />}
                              edge="end"
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      ),
                  )}
                  {uniqBy(
                    ({ parentContact: id }) => id,
                    reportsPeopleWithAnniversaries?.periods[0].people,
                  ).map(
                    (person) =>
                      person.anniversaryDay &&
                      person.anniversaryMonth && (
                        <ListItem
                          key={person.id}
                          data-testid={`PartnerCareAnniversaryListItem-${person.id}`}
                          button
                        >
                          <ListItemIcon>
                            <FavoriteIcon />
                          </ListItemIcon>
                          <ListItemText
                            disableTypography={true}
                            primary={
                              <Typography variant="body1">
                                {person.parentContact.name}
                              </Typography>
                            }
                            secondary={
                              <Box style={{ whiteSpace: 'nowrap' }}>
                                <Box
                                  component="div"
                                  textOverflow="ellipsis"
                                  overflow="hidden"
                                >
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    {dayMonthFormat(
                                      person.anniversaryDay,
                                      person.anniversaryMonth,
                                    )}
                                  </Typography>
                                </Box>
                              </Box>
                            }
                          />
                          {/*TODO: This button complete the Celebration and remove it from the list: https://jira.cru.org/browse/MPDX-6945 */}
                          <ListItemSecondaryAction>
                            <Checkbox
                              icon={<Brightness1Outlined />}
                              checkedIcon={<CheckCircle />}
                              edge="end"
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      ),
                  )}
                </CardList>
              )}
            </>
          )}
        </MotionDiv>
      )}
    </CardContainer>
  );
};

export default PartnerCare;
