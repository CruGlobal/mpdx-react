import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Avatar,
  makeStyles,
  Hidden,
  IconButton,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Icon } from '@mdi/react';
import {
  mdiArrowLeftBold,
  mdiArrowRightBold,
  mdiArrowUpBold,
  mdiArrowDownBold,
  mdiCloseThick,
} from '@mdi/js';
import theme from '../../../theme';

const useStyles = makeStyles(() => ({
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
  outter: {
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

export interface address {
  street: string;
  city: string;
  state?: string;
  zip: string;
}

interface Props {
  contact1: Contact;
  contact2: Contact;
  update: (id1: string, id2: string, action: string) => void;
}

interface Contact {
  id: string;
  title: string;
  source: string;
  address: address;
  date: string;
}

const Contact: React.FC<Props> = ({ contact1, contact2, update }) => {
  const [selected, setSelected] = useState('none');
  const { t } = useTranslation();
  const classes = useStyles();
  //TODO: Add button functionality
  //TODO: Make contact title a link to contact page

  const updateState = (side: string): void => {
    switch (side) {
      case 'left':
        setSelected('left');
        update(contact1.id, contact2.id, 'merge');
        break;
      case 'right':
        setSelected('right');
        update(contact2.id, contact1.id, 'merge');
        break;
      case 'cancel':
        setSelected('cancel');
        update(contact1.id, contact2.id, 'cancel');
        break;
      default:
        setSelected('');
        update(contact1.id, contact2.id, 'cancel');
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
                className={classes.outter}
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
                      <Typography variant="h6">{contact1.title}</Typography>
                    </Box>

                    <Typography>{t('Status:')}</Typography>
                    <Typography>{contact1.address.street}</Typography>
                    <Typography>{`${contact1.address.city}, ${contact1.address.state} ${contact1.address.zip}`}</Typography>
                    <Typography>
                      {t('From: {{where}}', { where: contact1.source })}
                    </Typography>
                    <Typography>
                      {t('On: {{when}}', { when: contact1.date })}
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
                        Use this one
                      </Typography>
                    )}
                    <Typography variant="h6">{contact2.title}</Typography>
                    <Typography>{t('Status:')}</Typography>
                    <Typography>{contact2.address.street}</Typography>
                    <Typography>{`${contact2.address.city}, ${contact2.address.state} ${contact2.address.zip}`}</Typography>
                    <Typography>
                      {t('From: {{where}}', { where: contact2.source })}
                    </Typography>
                    <Typography>
                      {t('On: {{when}}', { when: contact2.date })}
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

export default Contact;
