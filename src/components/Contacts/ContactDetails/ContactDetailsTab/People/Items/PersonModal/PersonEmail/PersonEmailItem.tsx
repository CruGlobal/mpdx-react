import {
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

import { useTranslation } from 'react-i18next';
import { FormikErrors, getIn } from 'formik';
import Lock from '@mui/icons-material/Lock';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionDeleteIcon } from '../ModalSectionDeleteIcon/ModalSectionDeleteIcon';
import {
  PersonCreateInput,
  PersonEmailAddressInput,
  PersonUpdateInput,
} from '../../../../../../../../../graphql/types.generated';
import {
  ContactInputField,
  NewSocial,
  PrimaryControlLabel,
} from '../PersonModal';
import { InputMaybe } from 'pages/api/graphql-rest.page.generated';

interface Props {
  emailAddress: PersonEmailAddressInput;
  index: number;
  emailAddresses: InputMaybe<PersonEmailAddressInput[]> | undefined;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined,
  ) => void;
  errors: FormikErrors<(PersonUpdateInput | PersonCreateInput) & NewSocial>;
  primaryEmail: PersonEmailAddressInput | undefined;
  handleChangePrimary: (emailId: string) => void;
  sources:
    | {
        id: string;
        source: string;
      }[]
    | undefined;
}

const EmailSelect = styled(Select)(({ destroyed }: { destroyed: boolean }) => ({
  textDecoration: destroyed ? 'line-through' : 'none',
}));

export const PersonEmailItem: React.FC<Props> = ({
  emailAddress,
  index,
  emailAddresses,
  setFieldValue,
  errors,
  primaryEmail,
  handleChangePrimary,
  sources,
}) => {
  const { t } = useTranslation();

  const [isEmailPrimaryChecked, setIsEmailPrimaryChecked] =
    React.useState(false);

  const source = sources?.find((email) => email.id === emailAddress.id)?.source;

  const locked = source !== 'MPDX' && source !== undefined;

  React.useEffect(() => {
    setIsEmailPrimaryChecked(emailAddress.id === primaryEmail?.id ?? '');
  }, [primaryEmail]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChangePrimary(event.target.value as string);
  };

  return (
    <>
      <ModalSectionContainer key={index}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ContactInputField
              label={t('Email Address')}
              destroyed={emailAddress.destroy ?? false}
              value={emailAddress.email}
              onChange={(event) =>
                setFieldValue(
                  `emailAddresses.${index}.email`,
                  event.target.value,
                )
              }
              disabled={!!emailAddress.destroy || locked}
              inputProps={{ 'aria-label': t('Email Address') }}
              InputProps={{
                ...(locked
                  ? {
                      endAdornment: (
                        <Lock
                          titleAccess={t('Synced with Donation Services')}
                        />
                      ),
                    }
                  : {}),
              }}
              error={getIn(errors, `emailAddresses.${index}`)}
              helperText={
                getIn(errors, `emailAddresses.${index}`) &&
                getIn(errors, `emailAddresses.${index}`).email
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id={`email-type-label-${index}`}>
                {t('Type')}
              </InputLabel>
              <EmailSelect
                label={t('Type')}
                labelId={`email-type-label-${index}`}
                id={`email-type-${index}`}
                destroyed={emailAddress.destroy ?? false}
                value={emailAddress.location ?? ''}
                onChange={(event) =>
                  setFieldValue(
                    `emailAddresses.${index}.location`,
                    event.target.value,
                  )
                }
                disabled={!!emailAddress.destroy || locked}
                inputProps={{
                  'aria-label': t('Email Address Type'),
                }}
                fullWidth
              >
                <MenuItem selected value="">
                  None
                </MenuItem>
                <MenuItem value="personal" aria-label={t('Personal')}>
                  {t('Personal')}
                </MenuItem>
                <MenuItem value="work" aria-label={t('Work')}>
                  {t('Work')}
                </MenuItem>
                <MenuItem value="other" aria-label={t('Other')}>
                  {t('Other')}
                </MenuItem>
              </EmailSelect>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <PrimaryControlLabel
              label={t('Primary')}
              control={
                <Checkbox
                  value={emailAddress.id}
                  checked={isEmailPrimaryChecked}
                  onChange={handleChange}
                  color="secondary"
                />
              }
              destroyed={emailAddress.destroy ?? false}
            />
          </Grid>
          <ModalSectionDeleteIcon
            disabled={locked}
            handleClick={
              emailAddress.id
                ? () =>
                    setFieldValue(
                      `emailAddresses.${index}.destroy`,
                      !emailAddress.destroy,
                    )
                : () => {
                    const temp = emailAddresses;
                    temp?.splice(index, 1);
                    setFieldValue('emailAddresses', temp);
                  }
            }
          />
        </Grid>
      </ModalSectionContainer>
    </>
  );
};
