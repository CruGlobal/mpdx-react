import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Formik } from 'formik';
import * as yup from 'yup';
import {
  Typography,
  DialogActions,
  TextField,
  FormHelperText,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { StyledFormLabel } from 'src/components/Shared/Forms/Field';
import { AccordianProps } from '../../accordianHelper';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { SubmitButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';

const StyledBox = styled(Box)(() => ({
  padding: '0 10px',
}));

export const AddOfflineOrganizationAccordian: React.FC<AccordianProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const accordianName = t('Add Offline Organization');
  const { enqueueSnackbar } = useSnackbar();

  type formikSchemaType = {
    name: string;
    country: string;
    website?: string;
  };

  const formikSchema: yup.SchemaOf<formikSchemaType> = yup.object({
    name: yup.string().email().required(),
    country: yup.string().required(),
    website: yup.string(),
  });

  const onSubmit = async (attributes: formikSchemaType) => {
    // const { user, reason, account } = attributes;

    // eslint-disable-next-line no-console
    console.log('onSubmit', attributes);

    // Need to build
    // await adminDeleteOrganizationInvite({
    //   variables: {
    //     input: {
    //       accountListId,
    //       inviteId: invite.id,
    //     },
    //   },
    //   update: (cache) => {
    //     cache.evict({ id: `AccountListInvites:${invite.id}` });
    //     cache.gc();
    //   },
    //   onCompleted: () => {
    enqueueSnackbar(t('Successfully created offline organization'), {
      variant: 'success',
    });
    //   },
    //   onError: () => {
    //     enqueueSnackbar(t('Unable to create offline organization'), {
    //       variant: 'error',
    //     });
    //   },
    // });
  };

  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={accordianName}
      value={''}
    >
      <StyledFormLabel>{accordianName}</StyledFormLabel>
      <Typography>
        {t(`Adding an offline organization enables users of that organization to log in to MPDX. Be aware that donations will
    need to be uploaded and/or entered manually for users of this organization.`)}
      </Typography>

      <Formik
        initialValues={{
          name: '',
          country: '',
          website: '',
        }}
        validationSchema={formikSchema}
        onSubmit={onSubmit}
      >
        {({
          values: { name, country, website },
          handleChange,
          handleSubmit,
          isSubmitting,
          isValid,
          errors,
        }): ReactElement => (
          <form onSubmit={handleSubmit}>
            <StyledBox marginTop={4}>
              <FieldWrapper>
                <TextField
                  required
                  id="name"
                  label={t('Name')}
                  type="text"
                  value={name}
                  disabled={isSubmitting}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus={true}
                  onChange={handleChange('name')}
                />
                {errors.name && (
                  <FormHelperText error={true}>{errors.name}</FormHelperText>
                )}
              </FieldWrapper>
            </StyledBox>
            <StyledBox marginTop={2}>
              <FieldWrapper>
                <TextField
                  required
                  id="website"
                  label={t('Website (optional)')}
                  type="text"
                  value={website}
                  disabled={isSubmitting}
                  onChange={handleChange('website')}
                />
              </FieldWrapper>
            </StyledBox>

            <StyledBox marginTop={2}>
              <FieldWrapper>
                <TextField
                  required
                  id="country"
                  label={t('Default Country')}
                  type="text"
                  value={country}
                  disabled={isSubmitting}
                  onChange={handleChange('country')}
                />
              </FieldWrapper>
            </StyledBox>

            <DialogActions>
              <SubmitButton
                disabled={!isValid || isSubmitting}
                variant="contained"
              >
                {t('Impersonate User')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </AccordionItem>
  );
};
