import React, { memo } from 'react';
import Star from '@mui/icons-material/Star';
import StarBorder from '@mui/icons-material/StarBorder';
import { Avatar, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { IdValue } from 'src/graphql/types.generated';
import theme from '../../../../theme';

export const PreviewBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  background: theme.palette.mpdxYellow.main,
}));

export const PreviewInnerBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  padding: theme.spacing(2),
}));

export const DetailsBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}));

export interface ContactFlowRowPreviewProps {
  name: string;
  status: {
    __typename?: 'IdValue' | undefined;
  } & Pick<IdValue, 'id' | 'value'>;
  starred: boolean;
  width: number;
}

export const ContactFlowRowPreview: React.FC<ContactFlowRowPreviewProps> = memo(
  function ContactFlowRowPreview({ name, status, starred, width }) {
    const { t } = useTranslation();
    return (
      <PreviewBox width={width}>
        <PreviewInnerBox>
          <DetailsBox>
            <Avatar
              src=""
              style={{
                width: theme.spacing(4),
                height: theme.spacing(4),
              }}
            />
            <Box display="flex" flexDirection="column" ml={2}>
              <Typography style={{ color: theme.palette.mpdxBlue.main }}>
                {name}
              </Typography>
              <Typography>
                {t('{{status}}', { status: status.value })}
              </Typography>
            </Box>
          </DetailsBox>
          <Box display="flex" pr={2}>
            {starred ? <Star /> : <StarBorder />}
          </Box>
        </PreviewInnerBox>
      </PreviewBox>
    );
  },
);
