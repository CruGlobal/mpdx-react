import React, { useState } from 'react';
import {
  mdiArrowDownBold,
  mdiArrowLeftBold,
  mdiArrowRightBold,
  mdiArrowUpBold,
  mdiCloseThick,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import {
  Avatar,
  Box,
  Grid,
  Hidden,
  IconButton,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import theme from '../../../theme';
import { PersonInfoFragment } from './GetPersonDuplicates.generated';

const useStyles = makeStyles()(() => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      border: `1px solid ${theme.palette.cruGrayMedium.main}`,
      padding: theme.spacing(2),
      backgroundColor: theme.palette.cruGrayLight.main,
    },
  },
  avatar: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  outer: {
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  contactBasic: {
    height: '100%',
    width: '45%',
    position: 'relative',
    '&:hover': {
      cursor: 'pointer',
    },
    [theme.breakpoints.down('sm')]: {
      backgroundColor: 'white',
      width: '100%',
    },
  },
  selected: {
    position: 'absolute',
    top: 0,
    right: 0,
    color: 'white',
    backgroundColor: theme.palette.mpdxGreen.main,
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  contactInfo: {
    width: '100%',
    overflow: 'auto',
    scrollbarWidth: 'thin',
  },
}));

interface Props {
  person1: PersonInfoFragment;
  person2: PersonInfoFragment;
  update: (id1: string, id2: string, action: string) => void;
}

const PersonDuplicate: React.FC<Props> = ({ person1, person2, update }) => {
  const [selected, setSelected] = useState('none');
  const { t } = useTranslation();
  const locale = useLocale();
  const { classes } = useStyles();
  //TODO: Add button functionality
  //TODO: Make contact title a link to contact page

  const updateState = (side: string): void => {
    switch (side) {
      case 'left':
        setSelected('left');
        update(person1.id, person2.id, 'merge');
        break;
      case 'right':
        setSelected('right');
        update(person2.id, person1.id, 'merge');
        break;
      case 'cancel':
        setSelected('cancel');
        update(person1.id, person2.id, 'cancel');
        break;
      default:
        setSelected('');
        update(person1.id, person2.id, 'cancel');
    }
  };

  return (
    <Grid container className={classes.container}>
      <Grid container>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center">
            <Grid container>
              <Box
                display="flex"
                style={{ width: '100%' }}
                className={classes.outer}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  className={classes.contactBasic}
                  onClick={() => updateState('left')}
                  p={2}
                  style={{
                    border:
                      selected === 'left'
                        ? `1px solid ${theme.palette.mpdxGreen.main}`
                        : `1px solid ${theme.palette.cruGrayMedium.main}`,
                  }}
                >
                  <Avatar src="" className={classes.avatar} />
                  <Box
                    display="flex"
                    flexDirection="column"
                    ml={2}
                    className={classes.contactInfo}
                  >
                    {selected === 'left' && (
                      <Typography variant="body2" className={classes.selected}>
                        {t('Use this one')}
                      </Typography>
                    )}
                    <Box
                      style={{
                        width: '100%',
                      }}
                    >
                      <Typography variant="h6">{`${person1.firstName} ${person1.lastName}`}</Typography>
                    </Box>

                    {person1.primaryPhoneNumber ? (
                      <>
                        <Typography>
                          {person1.primaryPhoneNumber.number}
                        </Typography>
                        <Typography>
                          {/* {t('From: {{where}}', { where: person1.primaryPhoneNumber.source })} */}
                        </Typography>
                      </>
                    ) : (
                      ''
                    )}
                    {person1.primaryEmailAddress ? (
                      <>
                        <Typography>
                          {person1.primaryEmailAddress.email}
                        </Typography>
                        <Typography>
                          {/* {t('From: {{where}}', { where: person1.primaryEmailAddress.source })} */}
                        </Typography>
                      </>
                    ) : (
                      ''
                    )}
                    <Typography>
                      {t('On: {{when}}', {
                        when: dateFormatShort(
                          DateTime.fromISO(person1.createdAt),
                          locale,
                        ),
                      })}
                    </Typography>
                  </Box>
                </Box>
                <Hidden smDown>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    style={{ height: '100%', width: '10%' }}
                  >
                    <IconButton
                      onClick={() => updateState('left')}
                      style={{
                        color:
                          selected === 'left'
                            ? theme.palette.mpdxGreen.main
                            : theme.palette.cruGrayMedium.main,
                      }}
                    >
                      <Icon path={mdiArrowLeftBold} size={1.5} />
                    </IconButton>
                    <IconButton
                      onClick={() => updateState('right')}
                      style={{
                        color:
                          selected === 'right'
                            ? theme.palette.mpdxGreen.main
                            : theme.palette.cruGrayMedium.main,
                      }}
                    >
                      <Icon path={mdiArrowRightBold} size={1.5} />
                    </IconButton>
                    <IconButton
                      onClick={() => updateState('cancel')}
                      style={{
                        color:
                          selected === 'cancel'
                            ? 'red'
                            : theme.palette.cruGrayMedium.main,
                      }}
                    >
                      <Icon path={mdiCloseThick} size={1.5} />
                    </IconButton>
                  </Box>
                </Hidden>
                <Hidden mdUp>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    style={{ height: '100%' }}
                  >
                    <IconButton
                      onClick={() => updateState('left')}
                      style={{
                        color:
                          selected === 'left'
                            ? theme.palette.mpdxGreen.main
                            : theme.palette.cruGrayMedium.main,
                      }}
                    >
                      <Icon path={mdiArrowUpBold} size={1.5} />
                    </IconButton>
                    <IconButton
                      onClick={() => updateState('right')}
                      style={{
                        color:
                          selected === 'right'
                            ? theme.palette.mpdxGreen.main
                            : theme.palette.cruGrayMedium.main,
                      }}
                    >
                      <Icon path={mdiArrowDownBold} size={1.5} />
                    </IconButton>
                    <IconButton
                      onClick={() => updateState('cancel')}
                      style={{
                        color:
                          selected === 'cancel'
                            ? 'red'
                            : theme.palette.cruGrayMedium.main,
                      }}
                    >
                      <Icon path={mdiCloseThick} size={1.5} />
                    </IconButton>
                  </Box>
                </Hidden>

                <Box
                  display="flex"
                  alignItems="center"
                  className={classes.contactBasic}
                  onClick={() => updateState('right')}
                  p={2}
                  style={{
                    border:
                      selected === 'right'
                        ? `1px solid ${theme.palette.mpdxGreen.main}`
                        : `1px solid ${theme.palette.cruGrayMedium.main}`,
                  }}
                >
                  <Avatar src="" className={classes.avatar} />
                  <Box
                    display="flex"
                    flexDirection="column"
                    ml={2}
                    style={{ width: '100%' }}
                  >
                    {selected === 'right' && (
                      <Typography variant="body2" className={classes.selected}>
                        {t('Use this one')}
                      </Typography>
                    )}
                    <Typography variant="h6">{`${person1.firstName} ${person1.lastName}`}</Typography>

                    {person1.primaryPhoneNumber ? (
                      <>
                        <Typography>
                          {person1.primaryPhoneNumber.number}
                        </Typography>
                        <Typography>
                          {/* {t('From: {{where}}', { where: person1.primaryPhoneNumber.source })} */}
                        </Typography>
                      </>
                    ) : (
                      ''
                    )}
                    {person1.primaryEmailAddress ? (
                      <>
                        <Typography>
                          {person1.primaryEmailAddress.email}
                        </Typography>
                        <Typography>
                          {/* {t('From: {{where}}', { where: person1.primaryEmailAddress.source })} */}
                        </Typography>
                      </>
                    ) : (
                      ''
                    )}
                    <Typography>
                      {t('On: {{when}}', {
                        when: dateFormatShort(
                          DateTime.fromISO(person2.createdAt),
                          locale,
                        ),
                      })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default PersonDuplicate;
