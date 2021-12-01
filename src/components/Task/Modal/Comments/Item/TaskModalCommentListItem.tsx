import { Box, Typography, styled, Button, Tooltip } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import theme from '../../../../../../src/theme';
import { GetCommentsForTaskModalCommentListQuery } from '../TaskListComments.generated';

interface Props {
  comment?: GetCommentsForTaskModalCommentListQuery['task']['comments']['nodes'][0];
}

const CommentInfoText = styled(Typography)(() => ({
  fontSize: 12,
  color: theme.palette.cruGrayDark.main,
}));

export const ActionButtonSmall = styled(Button)(() => ({
  color: theme.palette.info.main,
  fontSize: 12,
}));

const TaskModalCommentsListItem: React.FC<Props> = ({ comment }: Props) => {
  const { t } = useTranslation();

  return (
    <>
      <Box borderBottom={`1px solid ${theme.palette.cruGrayLight.main}`}>
        <Typography>{comment?.body}</Typography>
      </Box>
      <Box width="100%" display="flex" justifyContent="space-between" mb={2}>
        <Box>
          <CommentInfoText display="inline">
            {comment?.person.firstName} {comment?.person.lastName}{' '}
          </CommentInfoText>
          <Tooltip placement="bottom" title={comment?.createdAt || ''} arrow>
            <CommentInfoText display="inline">
              {`${comment?.createdAt.substring(
                5,
                7,
              )}/${comment?.createdAt.substring(
                8,
                10,
              )}/${comment?.createdAt.substring(0, 4)}`}
            </CommentInfoText>
          </Tooltip>
        </Box>
        <Box>
          <ActionButtonSmall size="small">{t('Edit')}</ActionButtonSmall>
          <ActionButtonSmall size="small">{t('Delete')}</ActionButtonSmall>
        </Box>
      </Box>
    </>
  );
};

export default TaskModalCommentsListItem;
