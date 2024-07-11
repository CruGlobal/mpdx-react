import React, { ReactElement, useContext, useEffect, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { cloneDeep } from 'lodash/fp';
import { useTranslation } from 'react-i18next';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { useGetContactTagListQuery } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Tags/ContactTags.generated';
import { ContactTagIcon, ContactTagInput } from 'src/components/Tags/Tags';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import {
  CsvImportContext,
  CsvImportType,
  CsvImportValue,
  CsvImportViewStepEnum,
} from './CsvImportContext';
import { CsvImportSuccessModal } from './CsvImportSuccessModal';
import { HeaderBox } from './HeaderBox';
import { get, save } from './csvImportService';
import { useSupportedHeaders } from './uploadCsvFile';

const StripedTableBody = styled(TableBody)(() => ({
  '&>*:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
}));

const CategoryHeader = styled(TableCell)(({ theme }) => ({
  borderRight: '1px solid #c0ddea',
  borderBottom: 0,
  backgroundColor: theme.palette.mpdxBlue.light,
  padding: '8px 10px',
}));

const LastColumn = styled(TableCell)(() => ({
  borderRight: '1px solid #e6e6e6',
}));

export interface CsvPreviewProps {
  accountListId: string;
  setCurrentTab: (currentTab: CsvImportViewStepEnum) => void;
}

const CsvPreview: React.FC<CsvPreviewProps> = ({
  accountListId,
  setCurrentTab,
}) => {
  const { uploadData, setUploadData, initialData, setInitialData, csvFileId } =
    useContext(CsvImportContext) as CsvImportValue;

  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const constants = useApiConstants() ?? {};
  const supportedHeaders = useSupportedHeaders();
  const { data: contactTagsList, loading: contactTagsListLoading } =
    useGetContactTagListQuery({
      variables: {
        accountListId,
      },
    });

  const [accept, setAccept] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!uploadData?.id && csvFileId) {
      get(accountListId, csvFileId, initialData).then((data) => {
        setInitialData(data);
        setUploadData(cloneDeep(data));
      });
    }
  }, [csvFileId, uploadData]);

  const handleBack = () => {
    setCurrentTab(
      !Object.keys(uploadData?.valuesToConstantsMappings ?? {}).length
        ? CsvImportViewStepEnum.Headers
        : CsvImportViewStepEnum.Values,
    );
  };

  const handleSave = () => {
    if (!uploadData || !initialData || !accountListId) {
      return;
    }

    uploadData.inPreview = false;
    save({
      uploadData,
      initialData,
      constants,
      accountListId,
      t,
      supportedHeaders,
      setUploadData,
      setInitialData,
    }).then(() => {
      setShowSuccessModal(true);
    });
  };

  if (!uploadData?.id) {
    return null;
  }

  return (
    <>
      <CsvImportSuccessModal
        isOpen={showSuccessModal}
        message={t(
          'Your CSV import has started and your contacts will be in MPDX shortly. We will email you when your import is complete.',
        )}
        handleClose={() => {
          setShowSuccessModal(false);
          setUploadData(null);
          window.location.assign(`/accountLists/${accountListId}/tools`);
        }}
      />
      <Box>
        <Box>
          <h4>{t('Add Tags to all imported contacts')}</h4>
          <Box display="flex" alignItems="center">
            <Autocomplete
              multiple
              freeSolo
              autoSelect
              autoHighlight
              fullWidth
              loading={contactTagsListLoading}
              popupIcon={<ContactTagIcon />}
              filterSelectedOptions
              value={
                uploadData.tagList
                  ? Array.isArray(uploadData.tagList)
                    ? uploadData.tagList
                    : uploadData.tagList.split(',')
                  : []
              }
              options={contactTagsList?.accountList?.contactTagList || []}
              renderInput={(params): ReactElement => (
                <ContactTagInput {...params} placeholder={t('add tag')} />
              )}
              onChange={(_, tagList): void => {
                const newUploadData = {
                  ...uploadData,
                  tagList: tagList,
                } as CsvImportType;

                setUploadData(newUploadData);
              }}
              sx={{ minWidth: '340px' }}
            />
          </Box>
        </Box>
      </Box>
      <Box sx={{ border: '1px solid', minWidth: '340px' }}>
        <HeaderBox>
          <Typography variant="body1">{t('Preview')}</Typography>
        </HeaderBox>
        <Box sx={{ padding: '10px 15px' }}>
          <Typography variant="body1">
            {t(
              `Please take a look at these sample rows that show how your CSV will import into ${appName}. If you would like to` +
                ' make changes, go back to Step 2 or back to Step 1 to reimport all over again.',
            )}
          </Typography>
        </Box>
        <Box sx={{ overflowX: 'scroll' }}>
          <Table sx={{ whiteSpace: 'nowrap' }}>
            <TableHead>
              <TableRow>
                <CategoryHeader colSpan={4}>{t('Details')}</CategoryHeader>
                <CategoryHeader colSpan={5}>{t('Commitment')}</CategoryHeader>
                <CategoryHeader colSpan={7}>{t('Address')}</CategoryHeader>
                <CategoryHeader colSpan={7}>{t('Primary')}</CategoryHeader>
                <CategoryHeader colSpan={4}>{t('Spouse')}</CategoryHeader>
                <CategoryHeader colSpan={7}>{t('Misc')}</CategoryHeader>
              </TableRow>
              <TableRow>
                <TableCell>{t('Contact Name')}</TableCell>
                <TableCell>{t('Greeting')}</TableCell>
                <TableCell>{t('Envelope Greeting')}</TableCell>
                <LastColumn>{t('Newsletter')}</LastColumn>

                <TableCell>{t('Status')}</TableCell>
                <TableCell>{t('Amount')}</TableCell>
                <TableCell>{t('Frequency')}</TableCell>
                <TableCell>{t('Currency')}</TableCell>
                <LastColumn>{t('Likely to Give')}</LastColumn>

                <TableCell>{t('Street')}</TableCell>
                <TableCell>{t('City')}</TableCell>
                <TableCell>{t('State')}</TableCell>
                <TableCell>{t('Zip')}</TableCell>
                <TableCell>{t('Country')}</TableCell>
                <TableCell>{t('Metro Area')}</TableCell>
                <LastColumn>{t('Region')}</LastColumn>

                <TableCell>{t('First Name')}</TableCell>
                <TableCell>{t('Last Name')}</TableCell>
                <TableCell>{t('Email 1')}</TableCell>
                <TableCell>{t('Email 2')}</TableCell>
                <TableCell>{t('Phone 1')}</TableCell>
                <TableCell>{t('Phone 2')}</TableCell>
                <LastColumn>{t('Phone 3')}</LastColumn>

                <TableCell>{t('First Name')}</TableCell>
                <TableCell>{t('Last Name')}</TableCell>
                <TableCell>{t('Email 1')}</TableCell>
                <LastColumn>{t('Phone 1')}</LastColumn>

                <TableCell>{t('Notes')}</TableCell>
                <TableCell>{t('Tags')}</TableCell>
                <TableCell>{t('Church')}</TableCell>
                <TableCell>{t('Website')}</TableCell>
                <TableCell>{t('Send Goals?')}</TableCell>
                <TableCell>{t('Referred By')}</TableCell>
                <LastColumn>{t('Relationship Code')}</LastColumn>
              </TableRow>
            </TableHead>

            <StripedTableBody>
              {uploadData.sampleContacts.map((contact) => {
                return (
                  <TableRow key={contact.name}>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact.greeting}</TableCell>
                    <TableCell>{contact.envelopeGreeting}</TableCell>
                    <LastColumn>{contact.sendNewsletter}</LastColumn>

                    <TableCell>{contact.status}</TableCell>
                    <TableCell>{contact.pledgeAmount}</TableCell>
                    <TableCell>
                      {constants.pledgeFrequency
                        ? constants.pledgeFrequency.find(
                            (element) =>
                              Number(element.key) ===
                              Number(contact.pledgeFrequency),
                          )?.value
                        : ''}
                    </TableCell>
                    <TableCell>{contact.pledgeCurrency}</TableCell>
                    <LastColumn>{contact.likelyToGive}</LastColumn>

                    <TableCell>{contact.addresses?.[0]?.street}</TableCell>
                    <TableCell>{contact.addresses?.[0]?.city}</TableCell>
                    <TableCell>{contact.addresses?.[0]?.state}</TableCell>
                    <TableCell>{contact.addresses?.[0]?.postalCode}</TableCell>
                    <TableCell>{contact.addresses?.[0]?.country}</TableCell>
                    <TableCell>{contact.addresses?.[0]?.metroArea}</TableCell>
                    <LastColumn>{contact.addresses?.[0]?.region}</LastColumn>

                    <TableCell>{contact.primaryPerson?.firstName}</TableCell>
                    <TableCell>{contact.primaryPerson?.lastName}</TableCell>
                    <TableCell>
                      {contact.primaryPerson?.emailAddresses?.[0]?.email}
                    </TableCell>
                    <TableCell>
                      {contact.primaryPerson?.emailAddresses?.[1]?.email}
                    </TableCell>
                    <TableCell>
                      {contact.primaryPerson?.phoneNumbers?.[0]?.number}
                    </TableCell>
                    <TableCell>
                      {contact.primaryPerson?.phoneNumbers?.[1]?.number}
                    </TableCell>
                    <LastColumn>
                      {contact.primaryPerson?.phoneNumbers?.[2]?.number}
                    </LastColumn>

                    <TableCell>{contact.spouse?.firstName}</TableCell>
                    <TableCell>{contact.spouse?.lastName}</TableCell>
                    <TableCell>
                      {contact.spouse?.emailAddresses?.[0]?.email}
                    </TableCell>
                    <LastColumn>
                      {contact.spouse?.phoneNumbers?.[0]?.number}
                    </LastColumn>

                    <TableCell>{contact.notes}</TableCell>
                    <TableCell>{`${JSON.stringify(
                      contact.tagList,
                    )}`}</TableCell>
                    <TableCell>{contact.churchName}</TableCell>
                    <TableCell>{contact.website}</TableCell>
                    <TableCell>{`${contact.noAppeals}`}</TableCell>
                    <TableCell>
                      {contact.contactReferralsToMe?.[0]?.referredBy.name}
                    </TableCell>
                    <LastColumn>{contact.relationshipCode}</LastColumn>
                  </TableRow>
                );
              })}
            </StripedTableBody>
          </Table>
        </Box>
        <Box
          sx={{
            backgroundColor: 'cruGrayLight.main',
            padding: '10px 15px',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <Button
            onClick={handleBack}
            sx={{
              bgcolor: 'cruGrayDark.main',
              color: 'white',
              height: '34px',
            }}
          >
            {t('Back')}
          </Button>
          <Box
            sx={{
              width: { xs: '100%', sm: 'auto' },
              marginTop: { xs: '6px', sm: 0 },
              marginLeft: { xs: '6px', sm: 0 },
            }}
          >
            <FormControlLabel
              label={t('I accept that this import cannot be undone')}
              control={
                <Checkbox id="accept" onClick={() => setAccept(!accept)} />
              }
            />
            <Button
              onClick={handleSave}
              disabled={!accept}
              sx={{
                bgcolor: 'mpdxBlue.main',
                color: 'white',
                height: '34px',
                marginTop: { xs: '6px', sm: 0 },
              }}
            >
              {t('Import')}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default CsvPreview;
