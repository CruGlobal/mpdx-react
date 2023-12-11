import { EmailAddress } from '../../../../graphql/types.generated';
import { CollapsibleList } from './CollapsibleList';
import {
  ContactInfoText,
  ContrastLink,
  SideContainerText,
} from './StyledComponents';

interface EmailProps {
  email: Pick<EmailAddress, 'email' | 'location'>;
}

const Email: React.FC<EmailProps> = ({ email }) => (
  <ContactInfoText data-testid="EmailAddress">
    <ContrastLink href={`mailto:${email.email}`} underline="hover">
      {email.email}
    </ContrastLink>
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
              <SideContainerText key={email.id}>
                <Email email={email} />
              </SideContainerText>
            ))
          : null
      }
    />
  );
};
