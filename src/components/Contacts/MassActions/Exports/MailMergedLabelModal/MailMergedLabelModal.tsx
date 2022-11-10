import {
  Grid,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Formik } from 'formik';
import { exportRest } from '../exportRest';
import Modal from '../../../../common/Modal/Modal';
import theme from '../../../../../theme';
import { ActionButton } from '../../../../common/Modal/ActionButtons/ActionButtons';

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
  const { data: sessionData } = useSession();
  const token = sessionData?.user?.apiToken ?? '';
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = async ({ template, sort }) => {
    try {
      exportRest(accountListId, ids, token, 'pdf', true, template, sort);
    } catch (err) {
      enqueueSnackbar(JSON.stringify(err), {
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
          <form onSubmit={handleSubmit} noValidate>
            <DialogContent>
              <Grid container>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="template">{t('Template')}</InputLabel>
                    <Select
                      labelId="template"
                      value={template}
                      onChange={(e) =>
                        setFieldValue('template', e.target.value)
                      }
                      style={{ marginBottom: theme.spacing(2) }}
                    >
                      {[
                        <MenuItem key="" value={undefined}>
                          {t('None')}
                        </MenuItem>,
                        <MenuItem key="Avery5160" value={'Avery5160'}>
                          {t('Avery 5160')}
                        </MenuItem>,
                        <MenuItem key="Avery7160" value={'Avery7160'}>
                          {t('Avery 7160')}
                        </MenuItem>,
                      ]}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="sort">{t('Sort By')}</InputLabel>
                    <Select
                      labelId="sort"
                      value={sort}
                      onChange={(e) => setFieldValue('sort', e.target.value)}
                      style={{ marginBottom: theme.spacing(2) }}
                    >
                      {[
                        <MenuItem key="Contact Name" value={'Contact Name'}>
                          {t('Contact Name')}
                        </MenuItem>,
                        <MenuItem key="Zip" value={'zip'}>
                          {t('Zip')}
                        </MenuItem>,
                      ]}
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
              <ActionButton
                color="primary"
                type="submit"
                variant="contained"
                disabled={!isValid || isSubmitting}
              >
                {t('Export')}
              </ActionButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
