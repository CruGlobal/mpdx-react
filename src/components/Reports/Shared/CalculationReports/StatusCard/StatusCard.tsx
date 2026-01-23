import NextLink from 'next/link';
import { useState } from 'react';
import { Print } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SubmitModal } from '../SubmitModal/SubmitModal';

interface StatusCardProps {
  formType: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
  linkOneText?: string;
  linkOne?: string;
  linkTwoText?: string;
  linkTwo?: string;
  isRequest?: boolean;
  hidePrint?: boolean;
  hideActions?: boolean;
  hideLinkTwoButton?: boolean;
  handlePrint?: () => void;
  handleConfirmCancel: () => void;
  handleLinkTwo?: () => void;
  styling?: SxProps<Theme>;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  formType,
  title,
  subtitle,
  icon: Icon,
  iconColor,
  children,
  linkOneText,
  linkOne,
  linkTwoText,
  linkTwo,
  isRequest,
  hidePrint,
  hideActions,
  hideLinkTwoButton,
  handlePrint,
  handleConfirmCancel,
  handleLinkTwo,
  styling,
}) => {
  const { t } = useTranslation();

  const [openCancel, setOpenCancel] = useState(false);

  const handleCancel = () => {
    setOpenCancel(false);
    handleConfirmCancel();
  };

  return (
    <Card sx={{ boxShadow: 1 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 1, bgcolor: iconColor }}>
              <Icon />
            </Avatar>
            {subtitle ? (
              <Box>
                <Typography component="span" sx={{ fontSize: 22 }}>
                  {title}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    display: 'block',
                    fontSize: 16,
                    color: 'text.secondary',
                  }}
                >
                  {subtitle}
                </Typography>
              </Box>
            ) : (
              <Typography sx={{ fontSize: 24 }}>{title}</Typography>
            )}
            {!hidePrint && (
              <IconButton
                sx={{ ml: 'auto' }}
                aria-label={t('Print')}
                onClick={handlePrint}
              >
                <Print sx={{ fontSize: '32px' }} titleAccess={t('Print')} />
              </IconButton>
            )}
          </Box>
        }
      />
      <CardContent sx={{ ...styling }}>{children}</CardContent>
      <Divider />
      {!hideActions && (
        <CardActionArea sx={{ p: 2 }}>
          <Button
            component={NextLink}
            href={linkOne ?? ''}
            variant={isRequest ? 'contained' : 'outlined'}
            sx={{ px: 2, py: 1, mr: 1 }}
          >
            {linkOneText}
          </Button>
          {!hideLinkTwoButton && (
            <Button
              component={linkTwo ? NextLink : 'button'}
              href={linkTwo}
              onClick={handleLinkTwo}
              variant={isRequest ? 'outlined' : 'contained'}
              sx={{ px: 2, py: 1 }}
            >
              {linkTwoText}
            </Button>
          )}
          {isRequest && (
            <Box sx={{ float: 'right' }}>
              <Button
                sx={{ color: 'error.light', px: 2, py: 1, fontWeight: 'bold' }}
                onClick={() => setOpenCancel(true)}
              >
                {t('Cancel Request')}
              </Button>
            </Box>
          )}
          {openCancel && (
            <SubmitModal
              formTitle={formType}
              handleClose={() => setOpenCancel(false)}
              handleConfirm={handleCancel}
              isCancel={true}
            />
          )}
        </CardActionArea>
      )}
    </Card>
  );
};
