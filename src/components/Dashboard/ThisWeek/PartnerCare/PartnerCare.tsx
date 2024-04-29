import Link from 'next/link';
import React, { ReactElement, useState } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Brightness1Outlined from '@mui/icons-material/Brightness1Outlined';
import CakeIcon from '@mui/icons-material/Cake';
import DoneIcon from '@mui/icons-material/Done';
import FavoriteIcon from '@mui/icons-material/Favorite';
import {
  Box,
  Button,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Skeleton,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Contact, PersonWithParentContact } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import useTaskModal from 'src/hooks/useTaskModal';
import theme from 'src/theme';
import illustration4 from '../../../../images/drawkit/grape/drawkit-grape-pack-illustration-4.svg';
import illustration7 from '../../../../images/drawkit/grape/drawkit-grape-pack-illustration-7.svg';
import { dayMonthFormat, numberFormat } from '../../../../lib/intlFormat';
import AnimatedCard from '../../../AnimatedCard';
import { GetThisWeekQuery } from '../GetThisWeek.generated';

const CardContainer = styled(AnimatedCard)(({ theme }) => ({
  flex: 'flex',
  flexDirection: 'column',
  height: 'auto',
  minHeight: '322px',
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

const CompleteButton = styled(IconButton)(({ theme }) => ({
  width: theme.spacing(3.5),
  height: theme.spacing(3.5),
  fontSize: '1.4rem',
  cursor: 'pointer',
  background: 'none',
  transition: theme.transitions.create(['background'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    backgroundColor: theme.palette.mpdxGreen.main,
  },
  '&:hover [name="Circle Icon"]': {
    opacity: 0,
  },
  '&:hover [name="Done Icon"]': {
    opacity: 1,
  },
  '&:hover [name="Add Icon"]': {
    opacity: 1,
  },
}));

const DoneHoverIcon = styled(DoneIcon)(({ theme }) => ({
  opacity: 0,
  color: theme.palette.common.white,
  position: 'absolute',
  left: '2px',
  transition: theme.transitions.create(['transform', 'opacity'], {
    duration: theme.transitions.duration.short,
  }),
  transform: 'rotate(0deg)',
}));

const AddHoverIcon = styled(AddCircleOutlineIcon)(({ theme }) => ({
  opacity: 0,
  color: theme.palette.common.white,
  position: 'absolute',
  left: '2px',
  transition: theme.transitions.create(['transform', 'opacity'], {
    duration: theme.transitions.duration.short,
  }),
}));

interface Props {
  accountListId: string;
  loading?: boolean;
  prayerRequestTasks?: GetThisWeekQuery['prayerRequestTasks'];
  reportsPeopleWithBirthdays?: GetThisWeekQuery['reportsPeopleWithBirthdays'];
  reportsPeopleWithAnniversaries?: GetThisWeekQuery['reportsPeopleWithAnniversaries'];
}

enum CelebrationTypeEnum {
  Birthday = 'birthday',
  Anniversary = 'anniversary',
}

const PartnerCare = ({
  accountListId,
  loading,
  prayerRequestTasks,
  reportsPeopleWithBirthdays,
  reportsPeopleWithAnniversaries,
}: Props): ReactElement => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [value, setValue] = useState(0);
  const { openTaskModal, preloadTaskModal } = useTaskModal();

  const handleClick = ({
    id: taskId,
  }: GetThisWeekQuery['prayerRequestTasks']['nodes'][0]): void => {
    openTaskModal({ taskId, view: 'edit' });
  };

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: number,
  ): void => {
    setValue(newValue);
  };

  const handleCreateClick = (
    celebrationType: CelebrationTypeEnum,
    person: GetThisWeekQuery['reportsPeopleWithAnniversaries']['periods'][0]['people'][0] &
      GetThisWeekQuery['reportsPeopleWithBirthdays']['periods'][0]['people'][0],
  ) => {
    openTaskModal({
      view: 'add',
      defaultValues: {
        contactIds: [person.parentContact.id],
        subject:
          celebrationType === CelebrationTypeEnum.Birthday
            ? `${person.firstName} ${person.lastName}'s Birthday`
            : `${person.parentContact.name}'s Anniversary`,
      },
    });
  };

  const handleCompleteClick = ({
    id: taskId,
  }: GetThisWeekQuery['prayerRequestTasks']['nodes'][0]): void => {
    openTaskModal({ taskId, showCompleteForm: true, view: 'complete' });
  };

  const mergedBirthdays =
    reportsPeopleWithBirthdays?.periods.map((period) => period.people).flat() ||
    [];
  const mergedAnniversaries =
    reportsPeopleWithAnniversaries?.periods
      .map((period) => period.people)
      .flat() || [];
  const celebrations: (Pick<
    PersonWithParentContact,
    | 'id'
    | 'birthdayDay'
    | 'birthdayMonth'
    | 'firstName'
    | 'lastName'
    | 'anniversaryMonth'
    | 'anniversaryDay'
  > & {
    parentContact: Pick<Contact, 'id' | 'name'>;
  })[] = mergedAnniversaries
    .concat(mergedBirthdays)
    .sort(
      (
        a: Pick<
          PersonWithParentContact,
          | 'id'
          | 'anniversaryDay'
          | 'anniversaryMonth'
          | 'birthdayDay'
          | 'birthdayMonth'
        >,
        b: Pick<
          PersonWithParentContact,
          | 'id'
          | 'anniversaryDay'
          | 'anniversaryMonth'
          | 'birthdayDay'
          | 'birthdayMonth'
        >,
      ) => {
        const month1 = a.birthdayMonth || a.anniversaryMonth || 0;
        const month2 = b.birthdayMonth || b.anniversaryMonth || 0;
        const day1 = a.birthdayDay || a.anniversaryDay || 0;
        const day2 = b.birthdayDay || b.anniversaryDay || 0;

        if (month1 === month2) {
          return day1 - day2;
        }
        return month1 - month2;
      },
    );

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
          label={t('Prayer ({{totalCount}})', {
            totalCount: numberFormat(
              prayerRequestTasks?.totalCount || 0,
              locale,
            ),
          })}
          data-testid="PartnerCareTabPrayer"
        />
        <Tab
          label={t('Celebrations ({{totalCount}})', {
            totalCount: numberFormat(
              (mergedAnniversaries?.length || 0) +
                (mergedBirthdays?.length || 0),
              locale,
            ),
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
                      <Skeleton variant="rectangular" width={20} height={20} />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </CardList>
              <CardActions>
                <Button size="small" color="primary" disabled>
                  {t('View All ({{totalCount}})', { totalCount: 0 })}
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
                    alt="No partner care prayer requests"
                  />
                  {t('No prayer requests to show.')}
                </CardContentContainer>
              )}
              {prayerRequestTasks && prayerRequestTasks.nodes.length > 0 && (
                <>
                  <CardList
                    data-testid="PartnerCarePrayerList"
                    style={{ minHeight: '165px', alignItems: 'start' }}
                  >
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
                        <ListItemSecondaryAction>
                          <CompleteButton
                            role="button"
                            aria-label={t('Complete')}
                            onClick={() => handleCompleteClick(task)}
                          >
                            <Brightness1Outlined name="Circle Icon" />
                            <DoneHoverIcon name="Done Icon" />
                          </CompleteButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </CardList>
                  <CardActions>
                    <Link
                      href={`/accountLists/${accountListId}/tasks?filters={"activityType":["PRAYER_REQUEST"]}&completed=false`}
                      passHref
                    >
                      <Button size="small" color="primary">
                        {t('View All ({{totalCount}})', {
                          totalCount: numberFormat(
                            prayerRequestTasks.totalCount,
                            locale,
                          ),
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
          style={{ height: theme.spacing(27) }}
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
                    <Skeleton variant="rectangular" width={20} height={20} />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </CardList>
          )}
          {!loading &&
            (!celebrations || (celebrations && celebrations.length === 0) ? (
              <CardContentContainer data-testid="PartnerCareCelebrationCardContentEmpty">
                <img src={illustration7} alt="No partner care celebrations" />
                {t('No celebrations to show.')}
              </CardContentContainer>
            ) : (
              <CardList data-testid="PartnerCareCelebrationList">
                {celebrations?.map(
                  (person, index) =>
                    (person.birthdayDay || person.anniversaryDay) &&
                    (person.birthdayMonth || person.anniversaryMonth) && (
                      <ListItem
                        key={person.id}
                        button
                        data-testid={`CelebrationItem-${index}`}
                      >
                        <ListItemIcon>
                          {person.birthdayDay ? <CakeIcon /> : <FavoriteIcon />}
                        </ListItemIcon>
                        <ListItemText
                          disableTypography={true}
                          primary={
                            <Typography variant="body1">
                              {person.birthdayDay
                                ? `${person.firstName} ${person.lastName}`
                                : person.parentContact.name}
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
                                  {person.birthdayDay
                                    ? dayMonthFormat(
                                        person.birthdayDay,
                                        person.birthdayMonth || 0,
                                        locale,
                                      )
                                    : dayMonthFormat(
                                        person.anniversaryDay || 0,
                                        person.anniversaryMonth || 0,
                                        locale,
                                      )}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <CompleteButton
                            role="button"
                            aria-label={t('Complete')}
                            onClick={() =>
                              handleCreateClick(
                                person.birthdayDay
                                  ? CelebrationTypeEnum.Birthday
                                  : CelebrationTypeEnum.Anniversary,
                                person,
                              )
                            }
                            onMouseEnter={() => preloadTaskModal('add')}
                          >
                            <Brightness1Outlined name="Circle Icon" />
                            <AddHoverIcon name="Add Icon" />
                          </CompleteButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ),
                )}
              </CardList>
            ))}
        </MotionDiv>
      )}
    </CardContainer>
  );
};

export default PartnerCare;
