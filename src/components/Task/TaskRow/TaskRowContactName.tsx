import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { Link, Theme, Typography, TypographyProps } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { TaskRowFragment } from './TaskRow.generated';

const useStyles = makeStyles()((theme: Theme) => ({
  contactName: {
    margin: '0',
    marginRight: theme.spacing(0.5),
    color: theme.palette.text.primary,
    fontFamily: theme.typography.fontFamily,
    fontSize: '14px',
    letterSpacing: '0.25',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

type TaskRowContactNameProps = {
  contact: TaskRowFragment['contacts']['nodes'][0];
  itemIndex: number;
  contactsLength: number;
} & TypographyProps;

export const TaskRowContactName: React.FC<TaskRowContactNameProps> = ({
  contact,
  itemIndex,
  contactsLength,
  ...props
}) => {
  const { classes } = useStyles();
  const router = useRouter();

  const { name } = contact;
  const contactName = itemIndex !== contactsLength - 1 ? `${name},` : name;

  // TODO: Refactor to pull this from context
  const contactHrefObject = {
    pathname: router.pathname,
    query: {
      accountListId: router.query.accountListId,
      contactId: [contact.id],
    },
  };

  return (
    <Link
      key={contact.id}
      component={NextLink}
      href={contactHrefObject}
      onClick={(event) => event.stopPropagation()}
      shallow
    >
      <Typography
        {...props}
        noWrap
        display="inline"
        className={classes.contactName}
      >
        {contactName}
      </Typography>
    </Link>
  );
};
