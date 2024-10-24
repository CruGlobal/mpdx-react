import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat';

export const TooltipTypography = styled(Typography)(() => ({
  fontSize: 11,
}));

interface CommentTooltipTextProps {
  comments: { id: string; body: string; updatedAt: string }[];
}
export const CommentTooltipText: React.FC<CommentTooltipTextProps> = ({
  comments,
}) => {
  const locale = useLocale();

  const latestComment = !!comments.length
    ? comments[comments.length - 1]
    : null;
  return latestComment ? (
    <>
      <TooltipTypography>{latestComment.body}</TooltipTypography>
      <TooltipTypography>
        {dateFormat(DateTime.fromISO(latestComment.updatedAt), locale)}
      </TooltipTypography>
    </>
  ) : null;
};
