import { PhoneNumber } from '../../../../graphql/types.generated';
import { CollapsibleList } from './CollapsibleList';
import {
  ContactInfoText,
  ContrastLink,
  SideContainerText,
} from './StyledComponents';

interface PhoneProps {
  phone: Pick<PhoneNumber, 'number' | 'location'>;
}

const Phone: React.FC<PhoneProps> = ({ phone }) => (
  <ContactInfoText data-testid="PhoneNumber">
    <ContrastLink href={`mailto:${phone.number}`} underline="hover">
      {phone.number}
    </ContrastLink>
    {phone.location ? ` - ${phone.location}` : null}
  </ContactInfoText>
);

interface CollapsiblePhoneListProps {
  phones: Array<Pick<PhoneNumber, 'id' | 'primary' | 'number' | 'location'>>;
}

export const CollapsiblePhoneList: React.FC<CollapsiblePhoneListProps> = ({
  phones,
}) => {
  const primaryPhone = phones.find((phone) => phone.primary) ?? phones[0];
  if (!primaryPhone) {
    return null;
  }
  const secondaryPhones = phones.filter((phone) => phone !== primaryPhone);

  return (
    <CollapsibleList
      primaryItem={<Phone phone={primaryPhone} />}
      secondaryItems={
        secondaryPhones.length
          ? secondaryPhones.map((phone) => (
              <SideContainerText key={phone.id}>
                <Phone phone={phone} />
              </SideContainerText>
            ))
          : null
      }
    />
  );
};
