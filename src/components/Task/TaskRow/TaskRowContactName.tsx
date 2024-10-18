import NextLink from 'next/link';
import React from 'react';
import { Theme, Typography, TypographyProps } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { ContactUrl } from 'pages/accountLists/[accountListId]/tasks/[[...contactId]].page';
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

type OnClickFunction = (
  event: React.MouseEvent<HTMLElement, MouseEvent>,
  contactId: string,
) => void;

type TaskRowContactNameProps = {
  contact: TaskRowFragment['contacts']['nodes'][0];
  itemIndex: number;
  contactsLength: number;
  selectContact: OnClickFunction;
  getContactUrl?: (contactId: string) => ContactUrl;
} & TypographyProps;

export const TaskRowContactName: React.FC<TaskRowContactNameProps> = ({
  contact,
  itemIndex,
  contactsLength,
  selectContact,
  getContactUrl,
  ...props
}) => {
  const { classes } = useStyles();

  const { id, name } = contact;
  const contactName = itemIndex !== contactsLength - 1 ? `${name},` : name;

  const contactUrl = getContactUrl && getContactUrl(contact.id).contactUrl;

  const handleOnContactClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
  ) => {
    selectContact(event, id);
    event.stopPropagation();
  };
  return (
    <>
      {contactUrl && (
        <NextLink
          href={contactUrl}
          shallow
          legacyBehavior
          passHref
          key={contact.id}
        >
          <Typography
            {...props}
            noWrap
            display="inline"
            onClick={handleOnContactClick}
            className={classes.contactName}
          >
            {contactName}
          </Typography>
        </NextLink>
      )}
      {!contactUrl && (
        <Typography
          {...props}
          noWrap
          display="inline"
          onClick={handleOnContactClick}
          className={classes.contactName}
        >
          {contactName}
        </Typography>
      )}
    </>
  );
};
