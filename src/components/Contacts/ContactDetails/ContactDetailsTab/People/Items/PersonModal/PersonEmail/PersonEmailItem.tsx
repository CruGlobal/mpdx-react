import React from 'react';
import Lock from '@mui/icons-material/Lock';
import {
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FormikErrors, getIn } from 'formik';
import { useTranslation } from 'react-i18next';
import { InputMaybe } from 'pages/api/graphql-rest.page.generated';
import {
  PersonCreateInput,
  PersonEmailAddressInput,
  PersonUpdateInput,
} from 'src/graphql/types.generated';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionDeleteIcon } from '../ModalSectionDeleteIcon/ModalSectionDeleteIcon';
import { NewSocial } from '../PersonModal';
import {
  ContactInputField,
  PrimaryControlLabel,
  VerticallyCenteredGrid,
} from '../StyledComponents';

interface Props {
  emailAddress: PersonEmailAddressInput;
  index: number;
  primaryIndex: number;
  emailAddresses: InputMaybe<PersonEmailAddressInput[]> | undefined;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined,
  ) => void;
  errors: FormikErrors<(PersonUpdateInput | PersonCreateInput) & NewSocial>;
  handleChangePrimary: (index: number) => void;
  sources:
    | {
        id: string;
        source: string;
      }[]
    | undefined;
}

const EmailSelect = styled(Select, {
  shouldForwardProp: (prop) => prop !== 'destroyed',
})(({ destroyed }: { destroyed: boolean }) => ({
  textDecoration: destroyed ? 'line-through' : 'none',
}));

export const PersonEmailItem: React.FC<Props> = ({
  emailAddress,
  index,
  primaryIndex,
  emailAddresses,
  setFieldValue,
  errors,
  handleChangePrimary,
  sources,
}) => {
  const { t } = useTranslation();

  const [isEmailPrimaryChecked, setIsEmailPrimaryChecked] =
    React.useState(false);

  const source = sources?.find((email) => email.id === emailAddress.id)?.source;

  const locked = source !== 'MPDX' && source !== undefined;

  React.useEffect(() => {
    setIsEmailPrimaryChecked(index === primaryIndex);
  }, [primaryIndex]);

  const handleChange = () => {
    handleChangePrimary(index);
  };

  return (
    <ModalSectionContainer key={index}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <ContactInputField
            label={t('Email Address')}
            destroyed={emailAddress.destroy ?? false}
            value={emailAddress.email}
            onChange={(event) =>
              setFieldValue(`emailAddresses.${index}.email`, event.target.value)
            }
            disabled={!!emailAddress.destroy || locked}
            inputProps={{ 'aria-label': t('Email Address') }}
            InputProps={{
              ...(locked
                ? {
                    endAdornment: (
                      <Lock titleAccess={t('Synced with Donation Services')} />
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
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel id={`email-type-label-${index}`}>
              {t('Type')}
            </InputLabel>
            <EmailSelect
              label={t('Type')}
              labelId={`email-type-label-${index}`}
              id={`email-type-${index}`}
              destroyed={emailAddress.destroy ?? false}
              value={emailAddress.location?.toLowerCase() ?? ''}
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
              <MenuItem value="work" aria-label={t('Work')}>
                {t('Work')}
              </MenuItem>
              <MenuItem value="personal" aria-label={t('Personal')}>
                {t('Personal')}
              </MenuItem>
              <MenuItem value="other" aria-label={t('Other')}>
                {t('Other')}
              </MenuItem>
            </EmailSelect>
          </FormControl>
        </Grid>
        <VerticallyCenteredGrid item xs={12} sm={6} md={2}>
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
        </VerticallyCenteredGrid>
        <VerticallyCenteredGrid item xs={12} sm={6} md={2}>
          <PrimaryControlLabel
            label={t('Invalid')}
            control={
              <Checkbox
                checked={emailAddress.historic === true}
                onChange={(event) =>
                  setFieldValue(
                    `emailAddresses.${index}.historic`,
                    event.target.checked,
                  )
                }
                color="secondary"
              />
            }
            destroyed={emailAddress.destroy ?? false}
          />
        </VerticallyCenteredGrid>
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
  );
};
