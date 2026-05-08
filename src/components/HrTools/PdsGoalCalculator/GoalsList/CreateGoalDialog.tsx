import React, { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useTranslation } from 'react-i18next';
import { DesignationSupportFormType } from 'src/graphql/types.generated';
import { isDesignationSupportFormType } from '../Shared/formType';

export interface CreateGoalDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (formType: DesignationSupportFormType) => Promise<void>;
  creating: boolean;
}

export const CreateGoalDialog: React.FC<CreateGoalDialogProps> = ({
  open,
  onClose,
  onCreate,
  creating,
}) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<DesignationSupportFormType | null>(
    null,
  );

  useEffect(() => {
    if (open) {
      setSelected(null);
    }
  }, [open]);

  const handleCreate = async () => {
    if (selected) {
      await onCreate(selected);
    }
  };

  const formTypeOptions: Array<{
    value: DesignationSupportFormType;
    title: string;
    description: string;
  }> = [
    {
      value: DesignationSupportFormType.Detailed,
      title: t('Default'),
      description: t(
        'Full calculator with reimbursable expenses and 403b contributions.',
      ),
    },
    {
      value: DesignationSupportFormType.Simple,
      title: t('Simple'),
      description: t(
        'Streamlined calculator without reimbursable expenses or 403b contributions.',
      ),
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="create-goal-dialog-title"
    >
      <DialogTitle id="create-goal-dialog-title">
        {t('Create a New Goal')}
      </DialogTitle>
      <DialogContent>
        <FormControl component="fieldset">
          <FormLabel sx={visuallyHidden}>{t('Select a form type')}</FormLabel>
          <RadioGroup
            value={selected ?? ''}
            onChange={(_, value) => {
              if (isDesignationSupportFormType(value)) {
                setSelected(value);
              }
            }}
          >
            {formTypeOptions.map(({ value, title, description }, index) => (
              <FormControlLabel
                key={value}
                value={value}
                control={<Radio />}
                label={
                  <>
                    <Typography variant="subtitle1">{title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {description}
                    </Typography>
                  </>
                }
                sx={{
                  alignItems: 'flex-start',
                  mb: index < formTypeOptions.length - 1 ? 2 : 0,
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={creating}>
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={!selected || creating}
          startIcon={
            creating ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {t('Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
