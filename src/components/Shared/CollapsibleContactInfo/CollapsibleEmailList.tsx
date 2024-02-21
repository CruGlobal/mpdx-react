import { Link, Typography } from '@mui/material';
import { EmailAddress } from 'src/graphql/types.generated';
import { CollapsibleList } from './CollapsibleList';
import { ContactInfoText } from './StyledComponents';

interface EmailProps {
  email: Partial<EmailAddress>;
}

const Email: React.FC<EmailProps> = ({ email }) => (
  <ContactInfoText data-testid="EmailAddress">
    <Link href={`mailto:${email.email}`} underline="hover">
      {email.email}
    </Link>
    <span>{email.location && ` - ${email.location}`}</span>
  </ContactInfoText>
);

interface CollapsibleEmailListProps {
  emails: Array<Partial<EmailAddress>>;
}

export const CollapsibleEmailList: React.FC<CollapsibleEmailListProps> = ({
  emails,
}) => {
  const primaryEmail = emails.find((email) => email.primary) ?? emails[0];
  if (!primaryEmail) {
    return null;
  }
  const secondaryEmails = emails.filter(
    (email) => email !== primaryEmail && !email.historic,
  );

  return (
    <CollapsibleList
      primaryItem={<Email email={primaryEmail} />}
      secondaryItems={
        secondaryEmails.length
          ? secondaryEmails.map((email) => (
              <Typography key={email.id}>
                <Email email={email} />
              </Typography>
            ))
          : null
      }
    />
  );
};
