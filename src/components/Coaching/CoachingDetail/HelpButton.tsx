import QuestionMark from '@mui/icons-material/QuestionMark';
import { IconButton } from '@mui/material';
import { ArticleVar, showArticle } from 'src/lib/helpScout';

interface HelpButtonProps {
  articleVar: ArticleVar;
}

export const HelpButton: React.FC<HelpButtonProps> = ({ articleVar }) => (
  <IconButton
    size="small"
    onClick={() => showArticle(articleVar)}
    aria-label="Help"
  >
    <QuestionMark />
  </IconButton>
);
