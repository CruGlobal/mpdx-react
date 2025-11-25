import NextLink from 'next/link';
import { useState } from 'react';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
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
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SubmitModal } from '../SubmitModal/SubmitModal';

//TODO: handle cancel request
//TODO: handle duplicate last years mha and view current mha links

interface CardSkeletonProps {
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
  hideDownload?: boolean;
  hideActions?: boolean;
  handleDownload?: () => void;
  handleConfirmCancel: () => void;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
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
  hideDownload,
  hideActions,
  handleDownload,
  handleConfirmCancel,
}) => {
  const { t } = useTranslation();

  const [openCancel, setOpenCancel] = useState(false);

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
                <Typography component="span" sx={{ fontSize: 18 }}>
                  {title}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    display: 'block',
                    fontSize: 14,
                    color: 'text.secondary',
                  }}
                >
                  {subtitle}
                </Typography>
              </Box>
            ) : (
              <Typography sx={{ fontSize: 24 }}>{title}</Typography>
            )}
            {!hideDownload && (
              <IconButton sx={{ ml: 'auto' }} aria-label={t('Download')}>
                <FileDownloadIcon
                  sx={{ fontSize: '32px' }}
                  titleAccess={t('Download')}
                  onClick={handleDownload}
                />
              </IconButton>
            )}
          </Box>
        }
      />
      <CardContent>{children}</CardContent>
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
          <Button
            component={NextLink}
            href={linkTwo ?? ''}
            variant="outlined"
            sx={{ px: 2, py: 1 }}
          >
            {linkTwoText}
          </Button>
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
              handleConfirm={() => {
                setOpenCancel(false);
                handleConfirmCancel();
              }}
              isCancel={true}
            />
          )}
        </CardActionArea>
      )}
    </Card>
  );
};
