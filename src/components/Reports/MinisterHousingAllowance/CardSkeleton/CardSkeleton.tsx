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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ConfirmationModal } from '../ConfirmationModal/ConfirmationModal';

//TODO: handle cancel request
//TODO: handle duplicate last years mha and view current mha links
interface CardSkeletonProps {
  title: string;
  icon: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
  titleOne: string;
  titleTwo: string;
  isRequest?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  title,
  icon: Icon,
  iconColor,
  children,
  titleOne,
  titleTwo,
  isRequest,
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
            {title}
            <IconButton sx={{ ml: 'auto' }} aria-label={t('Download')}>
              <FileDownloadIcon
                sx={{ fontSize: '32px' }}
                titleAccess={t('Download')}
              />
            </IconButton>
          </Box>
        }
      />
      <CardContent>{children}</CardContent>
      <Divider />
      <CardActionArea sx={{ p: 2 }}>
        <Button
          variant={isRequest ? 'contained' : 'outlined'}
          sx={{ px: 2, py: 1, mr: 1 }}
        >
          {t(titleOne)}
        </Button>
        <Button
          component={NextLink}
          href={isRequest ? editLink : ''}
          variant="outlined"
          sx={{ px: 2, py: 1 }}
        >
          {t(titleTwo)}
        </Button>
        {isRequest && (
          <Box sx={{ float: 'right' }}>
            <Button
              sx={{ color: 'error.light', px: 2, py: 1 }}
              onClick={() => setOpenCancel(true)}
            >
              <b>{t('CANCEL REQUEST')}</b>
            </Button>
          </Box>
        )}
        {openCancel && (
          <ConfirmationModal
            handleClose={() => setOpenCancel(false)}
            handleConfirm={() => setOpenCancel(false)}
            isCancel={true}
          />
        )}
      </CardActionArea>
    </Card>
  );
};
