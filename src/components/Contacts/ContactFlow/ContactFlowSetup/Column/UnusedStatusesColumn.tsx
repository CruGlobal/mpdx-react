import React, { useRef } from 'react';
import FiberManualRecord from '@mui/icons-material/FiberManualRecord';
import { Box, Card, CardContent, IconButton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { StatusEnum } from 'src/graphql/types.generated';
import theme from '../../../../../theme';
import { ContactFlowSetupDropZone } from '../DropZone/ContactFlowSetupDropZone';
import { ContactFlowSetupStatusRow } from '../Row/ContactFlowSetupStatusRow';

interface Props {
  statuses: StatusEnum[];
  accountListId: string;
  moveStatus: (
    originIndex: number,
    destinationIndex: number,
    status: StatusEnum,
  ) => void;
  loading: boolean;
  columnWidth: number;
}

export const UnusedStatusesColumn: React.FC<Props> = ({
  statuses,
  moveStatus,
  loading,
  columnWidth,
}: Props) => {
  const { t } = useTranslation();
  const CardContentRef = useRef<HTMLDivElement>();
  return (
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
        <Box
          ref={CardContentRef}
          width="100%"
          height="100%"
          display="flex"
          flexDirection="column"
        >
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={theme.spacing(4)}
            width="100%"
            borderBottom={`1px solid ${theme.palette.cruGrayMedium.main}`}
            style={{
              backgroundColor: theme.palette.common.white,
              padding: theme.spacing(2.5),
            }}
          >
            <IconButton
              style={{
                padding: 0,
              }}
            >
              <FiberManualRecord
                style={{
                  color: theme.palette.cruGrayMedium.main,
                  height: theme.spacing(4),
                  width: theme.spacing(4),
                }}
              />
            </IconButton>
          </Box>
          {columnWidth > 0 && (
            <Box style={{ backgroundColor: theme.palette.common.white }}>
              {statuses.map((status) => (
                <ContactFlowSetupStatusRow
                  key={status}
                  status={status}
                  columnWidth={columnWidth}
                  columnIndex={-1}
                />
              ))}
            </Box>
          )}
          {!loading && (
            <ContactFlowSetupDropZone
              columnIndex={-1}
              moveStatus={moveStatus}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
