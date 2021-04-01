import {
  Box,
  Button,
  makeStyles,
  Theme,
  ThemeProvider,
} from '@material-ui/core';
import { Create } from '@material-ui/icons';
import React from 'react';
import theme from '../../../../theme';
import { ContactDetailQuery } from '../ContactDetail.generated';

const useStyles = makeStyles((theme: Theme) => ({
  contactDetailHeadingContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
  },
  contactDetailHeadingText: {
    flexGrow: 5,
  },
  contactDetailHeadingIcon: {
    width: '18px',
    height: '18px',
    margin: theme.spacing(0),
    color: '#9C9FA1',
  },
  contactDetailContainer: {
    padding: theme.spacing(1),
  },
}));
interface ContactDetailTabProps {
  contact: ContactDetailQuery;
}

export const ContactDetailTab: React.FC<ContactDetailTabProps> = ({
  contact,
}) => {
  const classes = useStyles();
  const calledContact = contact.contact;

  return (
    <ThemeProvider theme={theme}>
      <Box style={{ width: '100%', paddingRight: '60px', paddingLeft: '60px' }}>
        <Box
          id="contact-detail-tags"
          className={classes.contactDetailContainer}
        ></Box>
        <hr />
        <Box
          id="contact-detail-people"
          className={classes.contactDetailContainer}
        >
          <Box className={classes.contactDetailHeadingContainer}>
            <h6 className={classes.contactDetailHeadingText}>
              {calledContact.name}
            </h6>
            <Create className={classes.contactDetailHeadingIcon} />
          </Box>
        </Box>
        <hr />
        <Box
          id="contact-detail-mailing"
          className={classes.contactDetailContainer}
        >
          <Box className={classes.contactDetailHeadingContainer}>
            <h6 className={classes.contactDetailHeadingText}>Mailing</h6>
            <Create className={classes.contactDetailHeadingIcon} />
          </Box>
        </Box>
        <hr />
        <Box
          id="contact-detail-other"
          className={classes.contactDetailContainer}
        >
          <Box className={classes.contactDetailHeadingContainer}>
            <h6 className={classes.contactDetailHeadingText}>Other</h6>
            <Create className={classes.contactDetailHeadingIcon} />
          </Box>
        </Box>
        <hr />
        <Button>DELETE CONTACT</Button>
      </Box>
    </ThemeProvider>
  );
};
