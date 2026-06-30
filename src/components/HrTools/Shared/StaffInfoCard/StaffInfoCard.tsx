import React from 'react';
import RightArrowIcon from '@mui/icons-material/ArrowForward';
import { Avatar, Button, Card, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface StaffInfoCardProps {
  /** The person currently displayed in the card header. */
  person: {
    name: string;
    avatarSrc?: string | null;
    /** Optional staff account number shown beneath the name. */
    staffAccountId?: string | null;
  };
  /** The other person to switch to */
  toggle?: { name: string; onClick: () => void };
  /** Card body rendered below the header. */
  children?: React.ReactNode;
}

/**
 * A card with a staff member's avatar/name and an optional spouse toggle header, plus a body slot
 * for the details of the selected person.
 */
export const StaffInfoCard: React.FC<StaffInfoCardProps> = ({
  person,
  toggle,
  children,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar
              src={person.avatarSrc ?? undefined}
              alt={person.name}
              variant="rounded"
              sx={{
                width: theme.spacing(5),
                height: theme.spacing(5),
              }}
            />
            <Stack>
              <Typography variant="h6" lineHeight={1.2}>
                {person.name}
              </Typography>
              {person.staffAccountId && (
                <Typography color="text.secondary" lineHeight={1.2}>
                  {t('Person Number: {{number}}', {
                    number: person.staffAccountId,
                  })}
                </Typography>
              )}
            </Stack>
          </Stack>
          {toggle && (
            <Button endIcon={<RightArrowIcon />} onClick={toggle.onClick}>
              {t('View {{name}}', { name: toggle.name })}
            </Button>
          )}
        </Stack>
        {children}
      </Stack>
    </Card>
  );
};
