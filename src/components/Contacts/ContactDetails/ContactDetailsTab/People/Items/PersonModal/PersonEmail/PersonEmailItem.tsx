import {
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  styled,
  TextField,
} from '@material-ui/core';
import React from 'react';

import { useTranslation } from 'react-i18next';
import { FormikErrors, getIn } from 'formik';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionDeleteIcon } from '../ModalSectionDeleteIcon/ModalSectionDeleteIcon';
import {
  PersonCreateInput,
  PersonEmailAddressInput,
  PersonUpdateInput,
} from '../../../../../../../../../graphql/types.generated';
import { NewSocial } from '../PersonModal';
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
}

const ContactInputField = styled(TextField)(
  ({ destroyed }: { destroyed: boolean }) => ({
    '&& > label': {
      textTransform: 'uppercase',
    },
    textDecoration: destroyed ? 'line-through' : 'none',
  }),
);

const EmailSelect = styled(Select)(({ destroyed }: { destroyed: boolean }) => ({
  textDecoration: destroyed ? 'line-through' : 'none',
}));

export const PersonEmailItem: React.FC<Props> = ({
  emailAddress,
  index,
  emailAddresses,
  setFieldValue,
  errors,
}) => {
  const { t } = useTranslation();

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
              disabled={!!emailAddress.destroy}
              inputProps={{ 'aria-label': t('Email Address') }}
              error={getIn(errors, `emailAddresses.${index}`)}
              helperText={
                getIn(errors, `emailAddresses.${index}`) &&
                getIn(errors, `emailAddresses.${index}`).email
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <EmailSelect
              destroyed={emailAddress.destroy ?? false}
              value={emailAddress.location ?? ''}
              onChange={(event) =>
                setFieldValue(
                  `emailAddresses.${index}.location`,
                  event.target.value,
                )
              }
              disabled={!!emailAddress.destroy}
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
          <FormControlLabel label={t('Primary')} control={<Checkbox />} />
          <ModalSectionDeleteIcon
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
