import React, { useId } from 'react';
import {
  Box,
  FormControlLabel,
  Radio,
  Typography,
  TypographyProps,
} from '@mui/material';

interface DescribedRadioOptionProps {
  value: string;
  label: string;
  /** Shown under the label in muted text to clarify what the option means. */
  description?: string;
  labelVariant?: TypographyProps['variant'];
  descriptionVariant?: TypographyProps['variant'];
}

// Matches the Radio's own padding so the first label line lines up with the circle.
const radioPadding = '9px';

/**
 * A radio option whose accessible name is the label alone, with the optional description exposed
 * through aria-describedby. Must be rendered inside a RadioGroup.
 */
export const DescribedRadioOption: React.FC<DescribedRadioOptionProps> = ({
  value,
  label,
  description,
  labelVariant = 'body1',
  descriptionVariant = 'caption',
}) => {
  const labelId = useId();
  const descriptionId = useId();

  return (
    <FormControlLabel
      value={value}
      control={
        <Radio
          inputProps={{
            'aria-labelledby': labelId,
            'aria-describedby': description ? descriptionId : undefined,
          }}
        />
      }
      disableTypography
      label={
        <Box sx={{ paddingBlock: radioPadding }}>
          <Typography
            id={labelId}
            variant={labelVariant}
            component="span"
            display="block"
          >
            {label}
          </Typography>
          {description && (
            <Typography
              id={descriptionId}
              variant={descriptionVariant}
              component="span"
              display="block"
              color="text.secondary"
            >
              {description}
            </Typography>
          )}
        </Box>
      }
      sx={{ alignItems: 'flex-start' }}
    />
  );
};
