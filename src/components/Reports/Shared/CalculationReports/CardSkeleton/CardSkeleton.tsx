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
import { useAccountListId } from 'src/hooks/useAccountListId';
import { SubmitModal } from '../../../MinisterHousingAllowance/SubmitModal/SubmitModal';

//TODO: handle cancel request
//TODO: handle duplicate last years mha and view current mha links

interface CardSkeletonProps {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
  titleOne?: string;
  titleTwo?: string;
  isRequest?: boolean;
  hideDownload?: boolean;
  hideActions?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  children,
  titleOne,
  titleTwo,
  isRequest,
  hideDownload,
  hideActions,
}) => {
  const { t } = useTranslation();

  const accountListId = useAccountListId();
  const editLink = `/accountLists/${accountListId}/reports/housingAllowance/edit`;

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
            variant={isRequest ? 'contained' : 'outlined'}
            sx={{ px: 2, py: 1, mr: 1 }}
          >
            {titleOne}
          </Button>
          <Button
            component={NextLink}
            href={isRequest ? editLink : ''}
            variant="outlined"
            sx={{ px: 2, py: 1 }}
          >
            {titleTwo}
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
              handleClose={() => setOpenCancel(false)}
              handleConfirm={() => setOpenCancel(false)}
              isCancel={true}
            />
          )}
        </CardActionArea>
      )}
    </Card>
  );
};
