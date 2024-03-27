import React, { ReactElement } from 'react';
import { LoadingButton } from '@mui/lab';
import {
  DialogActions,
  DialogContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useRequiredSession } from 'src/hooks/useRequiredSession';
import theme from '../../../../../theme';
import { ActionButton } from '../../../../common/Modal/ActionButtons/ActionButtons';
import Modal from '../../../../common/Modal/Modal';
import { exportRest } from '../exportRest';

interface MailMergedLabelModalProps {
  ids: string[];
  accountListId: string;
  handleClose: () => void;
}

const MailMergedLabelsSchema = yup.object({
  template: yup.string().nullable(),
  sort: yup.string().nullable(),
});

export const MailMergedLabelModal: React.FC<MailMergedLabelModalProps> = ({
  accountListId,
  ids,
  handleClose,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { apiToken } = useRequiredSession();

  const onSubmit = async ({ template, sort }) => {
    try {
      await exportRest(
        apiToken,
        accountListId,
        ids,
        'pdf',
        true,
        template,
        sort,
      );
    } catch (err) {
      const error = (err as Error)?.message ?? JSON.stringify(err);
      enqueueSnackbar(error, {
        variant: 'error',
      });
    }
    handleClose();
  };

  return (
    <Modal
      title={t('PDF of Mail Merged Labels')}
      isOpen={true}
      handleClose={handleClose}
    >
      <Formik
        initialValues={{
          template: 'Avery5160',
          sort: 'Contact Name',
        }}
        onSubmit={onSubmit}
        validationSchema={MailMergedLabelsSchema}
      >
        {({
          values: { template, sort },
          setFieldValue,
          handleSubmit,
          isSubmitting,
          isValid,
        }): ReactElement => (
          <form
            onSubmit={handleSubmit}
            noValidate
            data-testid="MailMergedLabel"
          >
            <DialogContent>
              <Grid container>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="template">{t('Template')}</InputLabel>
                    <Select
                      labelId="template"
                      label={t('Template')}
                      value={template}
                      onChange={(e) =>
                        setFieldValue('template', e.target.value)
                      }
                      style={{ marginBottom: theme.spacing(2) }}
                    >
                      <MenuItem key="" value={undefined}>
                        {t('None')}
                      </MenuItem>
                      <MenuItem key="Avery5160" value={'Avery5160'}>
                        {t('Avery 5160')}
                      </MenuItem>
                      <MenuItem key="Avery7160" value={'Avery7160'}>
                        {t('Avery 7160')}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="sort">{t('Sort By')}</InputLabel>
                    <Select
                      labelId="sort"
                      label={t('Sort By')}
                      value={sort}
                      onChange={(e) => setFieldValue('sort', e.target.value)}
                      style={{ marginBottom: theme.spacing(2) }}
                    >
                      <MenuItem key="Contact Name" value={'Contact Name'}>
                        {t('Contact Name')}
                      </MenuItem>
                      <MenuItem key="Zip" value={'zip'}>
                        {t('Zip')}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <ActionButton
                onClick={handleClose}
                disabled={isSubmitting}
                variant="text"
              >
                {t('Cancel')}
              </ActionButton>
              <LoadingButton
                color="primary"
                type="submit"
                variant="contained"
                sx={{ fontWeight: 700 }}
                disabled={!isValid || isSubmitting}
                loading={isSubmitting}
              >
                {t('Export')}
              </LoadingButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
