import {
  Button,
  Grid,
  Typography,
  Box,
  styled,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@material-ui/core';
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Formik } from 'formik';
import { exportRest } from '../exportRest';
import Modal from 'src/components/common/Modal/Modal';
import theme from 'src/theme';
import { ActionButton } from 'src/components/Task/Modal/Form/TaskModalForm';

interface MailMergedLabelModalProps {
  ids: string[];
  accountListId: string;
  handleClose: () => void;
}

const MailMergedLabelsSchema = yup.object({
  template: yup.string().nullable(),
  sort: yup.string().nullable(),
});

const ExportActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.mpdxBlue.main,
  width: '100%',
  color: theme.palette.common.white,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#006193',
  },
}));

export const MailMergedLabelModal: React.FC<MailMergedLabelModalProps> = ({
  accountListId,
  ids,
  handleClose,
}) => {
  const { t } = useTranslation();
  const { data: sessionData } = useSession();
  const token = sessionData?.user?.apiToken ?? '';
  const { enqueueSnackbar } = useSnackbar();

  const [labelModalOpen, setLabelModalOpen] = useState(false);

  const onSubmit = async (fields: { template: string; sort: string }) => {
    try {
      exportRest(accountListId, ids, token, 'pdf');
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
          template: 'Avery5610',
          sort: 'Contact Name',
        }}
        onSubmit={onSubmit}
        validationSchema={MailMergedLabelsSchema}
      >
        {({
          values: { template, sort },
          handleChange,
          handleSubmit,
          setFieldValue,
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
                      onChange={handleChange('template')}
                      style={{ marginBottom: theme.spacing(2) }}
                    >
                      {[
                        <MenuItem key="" value={undefined}>
                          {t('None')}
                        </MenuItem>,
                        <MenuItem key="Avery5610" value={'Avery5610'}>
                          {t('Avery 5610')}
                        </MenuItem>,
                        <MenuItem key="Avery7610" value={'Avery7610'}>
                          {t('Avery 7610')}
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
                      onChange={handleChange('sort')}
                      style={{ marginBottom: theme.spacing(2) }}
                    >
                      {[
                        <MenuItem key="" value={undefined}>
                          {t('None')}
                        </MenuItem>,
                        <MenuItem key="Contact Name" value={'Contact Name'}>
                          {t('Contact Name')}
                        </MenuItem>,
                        <MenuItem key="Zip" value={'Zip'}>
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
                {/* {updating && <LoadingIndicator color="primary" size={20} />} */}
                {t('Export')}
              </ActionButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
