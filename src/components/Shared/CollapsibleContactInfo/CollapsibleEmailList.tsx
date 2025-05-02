import { Link, Typography } from '@mui/material';
import { EmailAddress } from 'src/graphql/types.generated';
import { useEmailLocations } from 'src/hooks/useEmailLocations';
import { CollapsibleList } from './CollapsibleList';
import { ContactInfoText } from './StyledComponents';

interface EmailProps {
  email: Partial<EmailAddress>;
}

const Email: React.FC<EmailProps> = ({ email }) => {
  const locations = useEmailLocations();

  return (
    <ContactInfoText data-testid="EmailAddress">
      <Link href={`mailto:${email.email}`} target="_blank" underline="hover">
        {email.email}
      </Link>
      {email.location && (
        <span>
          {' - '}
          {locations[email.location.toLowerCase()] ?? email.location}
        </span>
      )}
    </ContactInfoText>
  );
};

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
