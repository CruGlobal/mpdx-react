import React, { ReactElement, useEffect, useState } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Alert,
  AlertTitle,
  Autocomplete,
  Box,
  Button,
  Card,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControl,
  FormControlLabel,
  Grid,
  LinearProgress,
  Link,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import * as yup from 'yup';
import { useGetContactTagListQuery } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Tags/ContactTags.generated';
import { LoadingSpinner } from 'src/components/Settings/Organization/LoadingSpinner';
import { ContactTagInput } from 'src/components/Tags/Tags';
import Modal from 'src/components/common/Modal/Modal';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import theme from 'src/theme';
import { uploadTnt, validateTnt } from './uploads/uploadTntConnect';

const BoldTypography = styled(Typography)(() => ({
  fontWeight: 'bold',
}));

const ContainerBox = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(1),
  width: '70%',
  display: 'flex',
  [theme.breakpoints.down('lg')]: {
    width: '100%',
  },
}));

const BottomBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.cruGrayLight.main,
  width: '100%',
  padding: theme.spacing(1),
  display: 'flex',
  justifyContent: 'end',
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(2),
  },
}));

const OuterBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  width: '100%',
  paddingX: theme.spacing(3),
}));

const Section = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const useStyles = makeStyles()(() => ({
  bulletList: {
    margin: '0 0 10px 15px',
    '> li': {
      margin: '5px',
    },
  },
}));

const tntSchema = yup.object({
  selectedTags: yup.array().of(yup.string()).default([]),
  override: yup.string().required(),
});

type Attributes = yup.InferType<typeof tntSchema>;

interface Props {
  accountListId: string;
}

const TntConnect: React.FC<Props> = ({ accountListId }: Props) => {
  const { classes } = useStyles();
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tntFile, setTntFile] = useState<{
    file: File;
    blobUrl: string;
  } | null>(null);

  const { data: contactTagsList, loading: contactTagsListLoading } =
    useGetContactTagListQuery({
      variables: {
        accountListId,
      },
    });

  const handleCloseModal = () => {
    setShowModal(false);
    window.location.href = `${process.env.SITE_URL}/accountLists/${accountListId}/tools`;
    setLoading(true);
  };

  const onSubmit = async (
    attributes: Attributes,
    { resetForm },
  ): Promise<void> => {
    const file = tntFile?.file;
    if (file) {
      try {
        await uploadTnt({
          override: attributes.override,
          selectedTags: attributes.selectedTags,
          file,
          t,
          accountListId,
        });
      } catch (err) {
        enqueueSnackbar(
          err instanceof Error ? err.message : t('File could not be uploaded'),
          {
            variant: 'error',
          },
        );
        return;
      }
    }
    resetForm();
    setTntFile(null);
    enqueueSnackbar(t('Upload Complete'), {
      variant: 'success',
    });
    setShowModal(true);
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const f = event.target.files?.[0];
    if (f) {
      updateTntFile(f);
    }
  };

  useEffect(() => {
    return () => {
      if (tntFile) {
        URL.revokeObjectURL(tntFile.blobUrl);
      }
    };
  }, [tntFile]);
  const updateTntFile = (file: File) => {
    const validationResult = validateTnt({ file, t });
    if (!validationResult.success) {
      enqueueSnackbar(validationResult.message, {
        variant: 'error',
      });
      return;
    }

    if (tntFile) {
      // Release the previous file blob
      URL.revokeObjectURL(tntFile.blobUrl);
    }
    setTntFile({ file, blobUrl: URL.createObjectURL(file) });
  };

  return (
    <OuterBox>
      {loading && (
        <LoadingSpinner firstLoad={true} data-testid="LoadingSpinner" />
      )}
      <ContainerBox container>
        <Typography>
          {t(
            "You can migrate all your contact information and history from TntConnect into {{appName}}. Most of your information will import straight into {{appName}}, including contact info, task history with notes, notes, user groups, and appeals. {{appName}} hides contacts with any of the not interested statuses, including 'Not Interested' and 'Never Ask' in {{appName}} (these contacts are imported, but will only show up if you search for hidden contacts).",
            { appName },
          )}
        </Typography>
        <Card
          sx={{
            marginY: theme.spacing(2),
            border: '1px solid',
            borderColor: theme.palette.cruGrayLight.main,
            width: '100%',
          }}
        >
          <Formik
            initialValues={{ selectedTags: [], override: 'false' }}
            validationSchema={tntSchema}
            onSubmit={onSubmit}
          >
            {({
              values: { selectedTags, override },
              handleSubmit,
              isSubmitting,
              setFieldValue,
              handleChange,
              isValid,
            }): ReactElement => (
              <form noValidate>
                <Box sx={{ padding: theme.spacing(2) }}>
                  <Alert severity="info" icon={false}>
                    <AlertTitle>
                      {t('You must have at least TntConnect 3.2')}
                    </AlertTitle>
                    <Link
                      sx={{ display: 'flex', alignItems: 'center' }}
                      href="http://www.tntware.com/TntConnect/downloads/"
                      underline="hover"
                      target="_blank"
                    >
                      {t('Get the Latest Version')}
                    </Link>
                  </Alert>
                  <Section>
                    <BoldTypography>
                      {t('Export your Database from TntConnect:')}
                    </BoldTypography>
                    <ul className={classes.bulletList}>
                      <li>
                        {t(
                          'Click on "File" choose "Utilities" from the list. Then "Maintenance".',
                        )}
                      </li>
                      <li>
                        {t(
                          'In the popup box, choose the top button, "Export Database to XML".',
                        )}
                      </li>
                      <li>{t('Then save to your computer.')}</li>
                    </ul>
                  </Section>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                      component="label"
                      variant="contained"
                      tabIndex={-1}
                      startIcon={<CloudUploadIcon />}
                    >
                      {t('Upload file')}
                      <VisuallyHiddenInput
                        data-testid="TntUpload"
                        type="file"
                        accept="application/xml"
                        onChange={handleFileChange}
                      />
                    </Button>
                    {tntFile && (
                      <Typography
                        sx={{ marginLeft: '10px', fontStyle: 'italic' }}
                      >
                        {tntFile.file.name}
                      </Typography>
                    )}
                  </Box>
                  <Section>
                    <BoldTypography>
                      {t('Tags for all imported TntConnect contacts')}
                    </BoldTypography>
                    <Autocomplete
                      multiple
                      freeSolo
                      autoSelect
                      autoHighlight
                      fullWidth
                      loading={contactTagsListLoading}
                      filterSelectedOptions
                      value={selectedTags}
                      options={
                        contactTagsList?.accountList?.contactTagList || []
                      }
                      renderInput={(params): ReactElement => (
                        <ContactTagInput
                          {...params}
                          placeholder={t('add tag')}
                          disabled={isSubmitting}
                        />
                      )}
                      onChange={(_, selectedTags): void =>
                        setFieldValue('selectedTags', selectedTags)
                      }
                    />
                    <FormControl>
                      <RadioGroup
                        aria-labelledby="demo-radio-buttons-group-label"
                        defaultValue="false"
                        name="override"
                        onChange={handleChange('override')}
                        value={override}
                      >
                        <FormControlLabel
                          value="false"
                          control={<Radio />}
                          label={t(
                            'This import should only fill blank fields in current contacts and/or add new contacts.',
                          )}
                        />
                        <FormControlLabel
                          value="true"
                          control={<Radio />}
                          label={t(
                            'This import should override all fields in current contacts (contact info, notes) and add new contacts.',
                          )}
                        />
                      </RadioGroup>
                    </FormControl>
                  </Section>
                  <Section>
                    {isSubmitting && (
                      <LinearProgress value={50} data-testid="LinearProgress" />
                    )}
                  </Section>
                </Box>
                <BottomBox>
                  <Button
                    variant="contained"
                    disabled={!isValid || isSubmitting || !tntFile}
                    onClick={() => handleSubmit()}
                  >
                    Import
                  </Button>
                </BottomBox>
              </form>
            )}
          </Formik>
        </Card>
      </ContainerBox>
      <Modal
        isOpen={showModal}
        handleClose={handleCloseModal}
        title={t('Good Work!')}
      >
        <>
          <DialogContent dividers>
            <DialogContentText
              component="div"
              sx={{ color: theme.palette.primary.dark }}
            >
              {t(
                "Your TntConnect data is importing. We'll send you an email as soon as it's all done and ready! Please be aware that it could take up to 12 hours.",
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={handleCloseModal}>
              Ok
            </Button>
          </DialogActions>
        </>
      </Modal>
    </OuterBox>
  );
};

export default TntConnect;
