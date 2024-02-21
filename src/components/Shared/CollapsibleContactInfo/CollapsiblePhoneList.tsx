import { Link, Typography } from '@mui/material';
import { PhoneNumber } from 'src/graphql/types.generated';
import { CollapsibleList } from './CollapsibleList';
import { ContactInfoText } from './StyledComponents';

interface PhoneProps {
  phone: Pick<PhoneNumber, 'number' | 'location'>;
}

const Phone: React.FC<PhoneProps> = ({ phone }) => (
  <ContactInfoText data-testid="PhoneNumber">
    <Link href={`tel:${phone.number}`} underline="hover">
      {phone.number}
    </Link>
    <span>{phone.location ? ` - ${phone.location}` : null}</span>
  </ContactInfoText>
);

interface CollapsiblePhoneListProps {
  phones: Array<Partial<PhoneNumber>>;
}

export const CollapsiblePhoneList: React.FC<CollapsiblePhoneListProps> = ({
  phones,
}) => {
  const primaryPhone = phones.find((phone) => phone.primary) ?? phones[0];
  if (!primaryPhone) {
    return null;
  }
  const secondaryPhones = phones.filter(
    (phone) => phone !== primaryPhone && !phone?.historic,
  );

  return (
    <CollapsibleList
      primaryItem={<Phone phone={primaryPhone} />}
      secondaryItems={
        secondaryPhones.length
          ? secondaryPhones.map((phone) => (
              <Typography key={phone.id}>
                <Phone phone={phone} />
              </Typography>
            ))
          : null
      }
    />
  );
};
