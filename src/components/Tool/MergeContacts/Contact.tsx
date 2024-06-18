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
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';
import theme from '../../../theme';
import { RecordInfoFragment } from './GetContactDuplicates.generated';

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
    padding: theme.spacing(2),
    '&:hover': {
      cursor: 'pointer',
    },
    [theme.breakpoints.down('sm')]: {
      backgroundColor: 'white',
      width: '100%',
    },
  },
  selectedBox: {
    border: '2px solid',
    borderColor: theme.palette.mpdxGreen.main,
  },
  unselectedBox: {
    border: '2px solid',
    borderColor: theme.palette.cruGrayMedium.main,
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
  green: {
    color: theme.palette.mpdxGreen.main,
  },
  grey: {
    color: theme.palette.cruGrayMedium.main,
  },
  red: {
    color: 'red',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  [theme.breakpoints.up('sm')]: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '10%',
  },
}));

interface Props {
  contact1: RecordInfoFragment;
  contact2: RecordInfoFragment;
  update: (id1: string, id2: string, action: string) => void;
}

const Contact: React.FC<Props> = ({ contact1, contact2, update }) => {
  const [selected, setSelected] = useState('none');
  const { t } = useTranslation();
  const locale = useLocale();
  const { classes } = useStyles();
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
    <Grid
      container
      className={classes.container}
      data-testid="MergeContactPair"
    >
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
                  className={`
                  ${classes.contactBasic} 
                  ${
                    selected === 'left'
                      ? classes.selectedBox
                      : classes.unselectedBox
                  }
                `}
                  onClick={() => updateState('left')}
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
                      <Typography variant="h6">{contact1.name}</Typography>
                    </Box>
                    {contact1.status && (
                      <Typography>
                        {t('Status: {{status}}', {
                          status: contactPartnershipStatus[contact1.status],
                        })}
                      </Typography>
                    )}
                    {contact1.primaryAddress ? (
                      <>
                        <Typography>
                          {contact1.primaryAddress.street}
                        </Typography>
                        <Typography>{`${contact1.primaryAddress.city}, ${contact1.primaryAddress.state} ${contact1.primaryAddress.postalCode}`}</Typography>
                      </>
                    ) : (
                      ''
                    )}
                    <Typography>
                      {t('From: {{where}}', { where: contact1.source })}
                    </Typography>
                    <Typography>
                      {t('On:')}{' '}
                      {dateFormatShort(
                        DateTime.fromISO(contact1.createdAt),
                        locale,
                      )}
                    </Typography>
                  </Box>
                </Box>
                <Hidden smDown>
                  <IconWrapper>
                    <IconButton
                      onClick={() => updateState('left')}
                      className={
                        selected === 'left' ? classes.green : classes.grey
                      }
                    >
                      <Icon path={mdiArrowLeftBold} size={1.5} />
                    </IconButton>
                    <IconButton
                      onClick={() => updateState('right')}
                      className={
                        selected === 'right' ? classes.green : classes.grey
                      }
                    >
                      <Icon path={mdiArrowRightBold} size={1.5} />
                    </IconButton>
                    <IconButton
                      onClick={() => updateState('cancel')}
                      className={
                        selected === 'cancel' ? classes.red : classes.grey
                      }
                    >
                      <Icon path={mdiCloseThick} size={1.5} />
                    </IconButton>
                  </IconWrapper>
                </Hidden>
                <Hidden smUp>
                  <IconWrapper>
                    <IconButton
                      onClick={() => updateState('left')}
                      className={
                        selected === 'left' ? classes.green : classes.grey
                      }
                    >
                      <Icon path={mdiArrowUpBold} size={1.5} />
                    </IconButton>
                    <IconButton
                      onClick={() => updateState('right')}
                      className={
                        selected === 'right' ? classes.green : classes.grey
                      }
                    >
                      <Icon path={mdiArrowDownBold} size={1.5} />
                    </IconButton>
                    <IconButton
                      onClick={() => updateState('cancel')}
                      className={
                        selected === 'cancel' ? classes.red : classes.grey
                      }
                    >
                      <Icon path={mdiCloseThick} size={1.5} />
                    </IconButton>
                  </IconWrapper>
                </Hidden>

                <Box
                  display="flex"
                  alignItems="center"
                  className={`
                    ${classes.contactBasic} 
                    ${
                      selected === 'right'
                        ? classes.selectedBox
                        : classes.unselectedBox
                    }
                  `}
                  onClick={() => updateState('right')}
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
                    <Typography variant="h6">{contact2.name}</Typography>
                    {contact2.status && (
                      <Typography>
                        {t('Status: {{status}}', {
                          status: contactPartnershipStatus[contact2.status],
                        })}
                      </Typography>
                    )}
                    {contact2.primaryAddress ? (
                      <>
                        <Typography>
                          {contact2.primaryAddress.street}
                        </Typography>
                        <Typography>{`${contact2.primaryAddress.city}, ${contact2.primaryAddress.state} ${contact2.primaryAddress.postalCode}`}</Typography>
                      </>
                    ) : (
                      ''
                    )}
                    <Typography>
                      {t('From: {{where}}', { where: contact2.source })}
                    </Typography>
                    <Typography>
                      {t('On:')}{' '}
                      {dateFormatShort(
                        DateTime.fromISO(contact2.createdAt),
                        locale,
                      )}
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
