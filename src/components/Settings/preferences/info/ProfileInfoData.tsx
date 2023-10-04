import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, IconButton, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as Types from '../../../../../graphql/types.generated';
import { Email, ExpandLess, ExpandMore, Phone } from '@mui/icons-material';

const ContactPersonRowContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
}));

const ContactPersonIconContainer = styled(Box)(() => ({
  width: '18px',
  height: '18px',
  marginRight: '10px',
}));

type EmailAddressPick = Pick<
  Types.EmailAddress,
  'id' | 'email' | 'primary' | 'location'
>;
type PhoneNumberPick = Pick<
  Types.PhoneNumber,
  'id' | 'number' | 'primary' | 'location'
>;

type EmailData = EmailAddressPick & PhoneNumberPick;
type PhoneData = PhoneNumberPick & EmailAddressPick;
type EmailDataArray = EmailAddressPick[] & PhoneNumberPick[];
type PhoneDataArray = PhoneNumberPick[] & EmailAddressPick[];

interface ProfileInfoDataProps {
  primaryData: EmailData | PhoneData;
  additionalData: EmailDataArray | PhoneDataArray;
}

export const ProfileInfoData: React.FC<ProfileInfoDataProps> = ({
  primaryData,
  additionalData,
}) => {
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isPhone = 'number' in (primaryData as PhoneData);

  const handleDropDownClick = () => setIsDropdownOpen(!isDropdownOpen);

  const additionalValues = useMemo(
    () => additionalData.filter((item) => !item?.primary),
    [additionalData],
  );

  return (
    <Box>
      {primaryData && (
        <ContactPersonRowContainer>
          <ContactPersonIconContainer>
            {isPhone && <Phone color="disabled" fontSize="small" />}
            {!isPhone && <Email color="disabled" fontSize="small" />}
          </ContactPersonIconContainer>
          <Typography variant="subtitle1">
            {isPhone && (
              <Link href={`tel:${primaryData?.number}`}>
                {primaryData?.number}
              </Link>
            )}
            {!isPhone && (
              <Link href={`mailto:${primaryData?.email}`}>
                {primaryData?.email}
              </Link>
            )}
          </Typography>
          {primaryData?.location && (
            <Typography variant="caption" marginLeft={1}>
              {t(primaryData?.location)}
            </Typography>
          )}
          {!!additionalValues?.length && (
            <Box style={{ marginLeft: '10px' }}>
              <IconButton
                aria-label="Expand/Hide"
                onClick={handleDropDownClick}
              >
                {!isDropdownOpen && <ExpandMore />}
                {isDropdownOpen && <ExpandLess />}
              </IconButton>
            </Box>
          )}

          {!!additionalValues?.length && isDropdownOpen && (
            <Box style={{ width: '100%' }}>
              {additionalValues.map((item) => {
                const isPhone = 'number' in (item as PhoneData);

                return (
                  <ContactPersonRowContainer key={item.id}>
                    <Typography variant="subtitle1">
                      {isPhone && (
                        <Link href={`tel:${(item as PhoneData)?.number}`}>
                          {(item as PhoneData)?.number}
                        </Link>
                      )}
                      {!isPhone && (
                        <Link href={`mailto:${item?.email}`}>
                          {item?.email}
                        </Link>
                      )}
                    </Typography>
                    {item?.location && (
                      <Typography variant="caption" marginLeft={1}>
                        {t(item?.location)}
                      </Typography>
                    )}
                  </ContactPersonRowContainer>
                );
              })}
            </Box>
          )}
        </ContactPersonRowContainer>
      )}
    </Box>
  );
};
