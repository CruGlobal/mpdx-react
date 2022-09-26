import { Checkbox, Grid, MenuItem, Select, styled } from '@material-ui/core';
import React from 'react';

import { useTranslation } from 'react-i18next';
import { FormikErrors, getIn } from 'formik';
import { Lock } from '@material-ui/icons';
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

const EmailSelect = styled(Select)(({ destroyed }: { destroyed: boolean }) => ({
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

  const [isEmailPrimaryChecked, setIsEmailPrimaryChecked] = React.useState(
    false,
  );

  const source = sources?.find((email) => email.id === emailAddress.id)?.source;

  const locked = source !== 'MPDX' && source !== undefined;

  React.useEffect(() => {
    setIsEmailPrimaryChecked(index === primaryIndex);
  }, [primaryIndex]);

  const handleChange = () => {
    handleChangePrimary(index);
    console.log(index);
  };

  return (
    <>
      <ModalSectionContainer key={index}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ContactInputField
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
            <EmailSelect
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
              <MenuItem selected value=""></MenuItem>
              <MenuItem value="Mobile" aria-label={t('Mobile')}>
                {t('Mobile')}
              </MenuItem>
              <MenuItem value="Work" aria-label={t('Work')}>
                {t('Work')}
              </MenuItem>
            </EmailSelect>
          </Grid>
          <Grid item xs={12} md={3}>
            <PrimaryControlLabel
              label={t('Primary')}
              control={
                <Checkbox
                  value={emailAddress.id}
                  checked={isEmailPrimaryChecked}
                  onChange={handleChange}
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
