import QuestionMark from '@mui/icons-material/QuestionMark';
import { IconButton } from '@mui/material';
import { ArticleVar, articles } from 'src/lib/helpjuice';

interface HelpButtonProps {
  articleVar: ArticleVar;
}

export const HelpButton: React.FC<HelpButtonProps> = ({ articleVar }) => {
  const url = articles[articleVar];
  if (!url) {
    return null;
  }

  return (
    <IconButton
      href={url}
      target="_blank"
      rel="nofollow noreferrer"
      size="small"
      aria-label="Help"
    >
      <QuestionMark />
    </IconButton>
  );
};
