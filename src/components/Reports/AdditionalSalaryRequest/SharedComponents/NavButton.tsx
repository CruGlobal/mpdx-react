import React from 'react';
import { Button, ButtonProps, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

type NavButtonType = 'continue' | 'cancel' | 'back' | 'submit';

interface NavButtonProps {
  type: NavButtonType;
  onClick: () => void;
}

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 4),
}));

export const NavButton: React.FC<NavButtonProps> = ({ type, onClick }) => {
  const { t } = useTranslation();

  const config: Record<
    NavButtonType,
    {
      text: string;
      tooltip: string;
      color?: ButtonProps['color'];
      variant?: ButtonProps['variant'];
    }
  > = {
    continue: {
      text: t('Continue'),
      tooltip: t(
        'Proceed to the next section. Your progress is automatically saved as you go.',
      ),
      variant: 'contained',
    },
    cancel: {
      text: t('Cancel'),
      tooltip: t('Cancel and return to the previous page.'),
      color: 'error',
    },
    back: {
      text: t('Back'),
      tooltip: t('Return to the previous section.'),
      variant: 'outlined',
    },
    submit: {
      text: t('Submit'),
      tooltip: t('Submit your additional salary request.'),
      variant: 'contained',
      color: 'primary',
    },
  };

  const { text, tooltip, color, variant = 'text' } = config[type];

  return (
    <Tooltip title={tooltip}>
      <StyledButton
        variant={variant}
        color={color}
        size="small"
        onClick={onClick}
      >
        {text}
      </StyledButton>
    </Tooltip>
  );
};
