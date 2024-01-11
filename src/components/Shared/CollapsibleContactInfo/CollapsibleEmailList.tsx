import { Link, Typography } from '@mui/material';
import { EmailAddress } from 'src/graphql/types.generated';
import { CollapsibleList } from './CollapsibleList';
import { ContactInfoText } from './StyledComponents';

interface EmailProps {
  email: Pick<EmailAddress, 'email' | 'location'>;
}

const Email: React.FC<EmailProps> = ({ email }) => (
  <ContactInfoText data-testid="EmailAddress">
    <Link href={`mailto:${email.email}`} underline="hover">
      {email.email}
    </Link>
    {email.location ? ` - ${email.location}` : null}
  </ContactInfoText>
);

interface CollapsibleEmailListProps {
  emails: Array<Pick<EmailAddress, 'id' | 'primary' | 'email' | 'location'>>;
}

export const CollapsibleEmailList: React.FC<CollapsibleEmailListProps> = ({
  emails,
}) => {
  const primaryEmail = emails.find((email) => email.primary) ?? emails[0];
  if (!primaryEmail) {
    return null;
  }
  const secondaryEmails = emails.filter((email) => email !== primaryEmail);

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
