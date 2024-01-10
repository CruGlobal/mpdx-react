import React, { useMemo, useState } from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Box, IconButton, Link, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import * as Types from 'src/graphql/types.generated';

const ContactPersonRowContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  justifyContent: 'center',
  [theme.breakpoints.up('sm')]: {
    justifyContent: 'flex-start',
  },
}));

type EmailAddressPick = Pick<
  Types.EmailAddress,
  'id' | 'email' | 'primary' | 'location'
>;
type PhoneNumberPick = Pick<
  Types.PhoneNumber,
  'id' | 'number' | 'primary' | 'location'
>;

type EmailData = EmailAddressPick | PhoneNumberPick;
type PhoneData = PhoneNumberPick | EmailAddressPick;
type EmailDataArray = EmailAddressPick[] | PhoneNumberPick[];
type PhoneDataArray = PhoneNumberPick[] | EmailAddressPick[];

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
        <ContactPersonRowContainer sx={{ marginLeft: '0' }}>
          <Typography variant="subtitle1">
            {isPhone && (
              <Link href={`tel:${primaryData?.number}`} underline="hover">
                {primaryData?.number}
              </Link>
            )}
            {!isPhone && (
              <Link href={`mailto:${primaryData?.email}`} underline="hover">
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
                size="small"
              >
                {!isDropdownOpen && <ExpandMore fontSize="small" />}
                {isDropdownOpen && <ExpandLess fontSize="small" />}
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
                        <Link
                          href={`tel:${(item as PhoneData)?.number}`}
                          underline="hover"
                        >
                          {(item as PhoneData)?.number}
                        </Link>
                      )}
                      {!isPhone && (
                        <Link href={`mailto:${item?.email}`} underline="hover">
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
