import {
  Box,
  Card,
  CardContent,
  IconButton,
  Typography,
} from '@material-ui/core';
import { FiberManualRecord } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import theme from '../../../../../../src/theme';
import { ContactFilterStatusEnum } from '../../../../../../graphql/types.generated';
import { ContactFlowSetupStatusRow } from './ContactFlowSetupColumn';

interface Props {
  statuses: ContactFilterStatusEnum[];
  accountListId: string;
}

export const UnusedStatusesColumn: React.FC<Props> = ({ statuses }: Props) => {
  const { t } = useTranslation();
  return (
    <>
      <Card>
        <Box
          p={2}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          data-testid="column-header"
          borderBottom={`5px solid ${theme.palette.cruGrayMedium.main}`}
          height={theme.spacing(7)}
        >
          <Typography>{t('Unused Statuses')}</Typography>
        </Box>
        <CardContent
          style={{
            position: 'relative',
            height: 'calc(100vh - 230px)',
            padding: 0,
            background: theme.palette.cruGrayLight.main,
            overflowY: 'auto',
          }}
        >
          <Box width="100%" height="100%">
            <Box
              width="100%"
              display="flex"
              justifyContent="center"
              borderBottom={`1px solid ${theme.palette.cruGrayMedium.main}`}
              style={{ backgroundColor: theme.palette.common.white }}
            >
              <IconButton>
                <FiberManualRecord
                  style={{
                    color: theme.palette.cruGrayMedium.main,
                    height: theme.spacing(4),
                    width: theme.spacing(4),
                  }}
                />
              </IconButton>
            </Box>
            <Box style={{ backgroundColor: theme.palette.common.white }}>
              {statuses.map((status) => (
                <ContactFlowSetupStatusRow key={status}>
                  <Typography>{status}</Typography>
                </ContactFlowSetupStatusRow>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};
