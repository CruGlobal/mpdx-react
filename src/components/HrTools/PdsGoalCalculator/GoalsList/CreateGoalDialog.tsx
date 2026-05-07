import React, { useState } from 'react';
import {
  Button,
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
import { useTranslation } from 'react-i18next';
import { DesignationSupportFormType } from 'src/graphql/types.generated';

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

  const handleCreate = async () => {
    if (selected) {
      await onCreate(selected);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('Create a New Goal')}</DialogTitle>
      <DialogContent>
        <FormControl component="fieldset">
          <FormLabel sx={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
            {t('Select a form type')}
          </FormLabel>
          <RadioGroup
            value={selected ?? ''}
            onChange={(_, value) =>
              setSelected(value as DesignationSupportFormType)
            }
          >
            <FormControlLabel
              value={DesignationSupportFormType.Detailed}
              control={<Radio />}
              label={
                <>
                  <Typography variant="subtitle1">{t('Default')}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t(
                      'Full calculator with reimbursable expenses and 403b contributions.',
                    )}
                  </Typography>
                </>
              }
              sx={{ alignItems: 'flex-start', mb: 2 }}
            />
            <FormControlLabel
              value={DesignationSupportFormType.Simple}
              control={<Radio />}
              label={
                <>
                  <Typography variant="subtitle1">{t('Simple')}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t(
                      'Streamlined calculator without reimbursable expenses or 403b contributions.',
                    )}
                  </Typography>
                </>
              }
              sx={{ alignItems: 'flex-start' }}
            />
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
        >
          {t('Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
