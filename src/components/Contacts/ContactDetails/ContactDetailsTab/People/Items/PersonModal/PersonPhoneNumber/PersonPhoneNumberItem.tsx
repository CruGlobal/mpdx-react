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
import {
  InputMaybe,
  PersonCreateInput,
  PersonPhoneNumberInput,
  PersonUpdateInput,
} from 'src/graphql/types.generated';
import { usePhoneLocations } from 'src/hooks/usePhoneLocations';
import { isEditableSource } from 'src/utils/sourceHelper';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionDeleteIcon } from '../ModalSectionDeleteIcon/ModalSectionDeleteIcon';
import { NewSocial } from '../PersonModal';
import {
  ContactInputField,
  PrimaryControlLabel,
  VerticallyCenteredGrid,
} from '../StyledComponents';

interface Props {
  phoneNumber: PersonPhoneNumberInput & { source?: string };
  index: number;
  primaryIndex: number;
  phoneNumbers: InputMaybe<PersonPhoneNumberInput[]> | undefined;
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

const PhoneNumberSelect = styled(Select, {
  shouldForwardProp: (prop) => prop !== 'destroyed',
})(({ destroyed }: { destroyed: boolean }) => ({
  textDecoration: destroyed ? 'line-through' : 'none',
}));

export const PersonPhoneNumberItem: React.FC<Props> = ({
  phoneNumber,
  index,
  primaryIndex,
  phoneNumbers,
  setFieldValue,
  errors,
  handleChangePrimary,
  sources,
}) => {
  const { t } = useTranslation();

  const [isPrimaryChecked, setIsPrimaryChecked] = React.useState(false);

  const locations = usePhoneLocations();

  const source = sources?.find(
    (number) => number.id === phoneNumber.id,
  )?.source;

  const locked = !isEditableSource(source);

  React.useEffect(() => {
    setIsPrimaryChecked(index === primaryIndex);
  }, [primaryIndex]);

  const handleChange = () => {
    handleChangePrimary(index);
  };

  return (
    <ModalSectionContainer key={index}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <ContactInputField
            label={t('Phone Number')}
            destroyed={phoneNumber.destroy ?? false}
            value={phoneNumber.number ?? ''}
            onChange={(event) =>
              setFieldValue(`phoneNumbers.${index}.number`, event.target.value)
            }
            disabled={!!phoneNumber.destroy || locked}
            inputProps={{ 'aria-label': t('Phone Number') }}
            InputProps={{
              ...(locked
                ? {
                    endAdornment: (
                      <Lock titleAccess={t('Synced with Donation Services')} />
                    ),
                  }
                : {}),
            }}
            error={getIn(errors, `phoneNumbers.${index}`)}
            helperText={
              getIn(errors, `phoneNumbers.${index}`) &&
              getIn(errors, `phoneNumbers.${index}`).number
            }
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel id={`phone-type-label-${index}`}>
              {t('Type')}
            </InputLabel>
            <PhoneNumberSelect
              label={t('Type')}
              labelId={`phone-type-label-${index}`}
              id={`phone-type-${index}`}
              destroyed={phoneNumber.destroy ?? false}
              value={phoneNumber.location?.toLowerCase() ?? ''}
              onChange={(event) =>
                setFieldValue(
                  `phoneNumbers.${index}.location`,
                  event.target.value,
                )
              }
              disabled={!!phoneNumber.destroy || locked}
              inputProps={{
                'aria-label': t('Phone Number Type'),
              }}
              fullWidth
            >
              <MenuItem selected value="">
                {t('None')}
              </MenuItem>
              {Object.entries(locations).map(([value, label]) => (
                <MenuItem value={value} key={value}>
                  {label}
                </MenuItem>
              ))}
            </PhoneNumberSelect>
          </FormControl>
        </Grid>
        <VerticallyCenteredGrid item xs={12} sm={6} md={2}>
          <PrimaryControlLabel
            label={t('Primary')}
            control={
              <Checkbox
                value={phoneNumber.id}
                checked={isPrimaryChecked}
                onChange={handleChange}
                color="secondary"
              />
            }
            destroyed={phoneNumber.destroy ?? false}
          />
        </VerticallyCenteredGrid>
        <VerticallyCenteredGrid item xs={12} sm={6} md={2}>
          <PrimaryControlLabel
            label={t('Invalid')}
            control={
              <Checkbox
                checked={phoneNumber.historic === true}
                onChange={(event) =>
                  setFieldValue(
                    `phoneNumbers.${index}.historic`,
                    event.target.checked,
                  )
                }
                color="secondary"
              />
            }
            destroyed={phoneNumber.destroy ?? false}
          />
        </VerticallyCenteredGrid>
        <ModalSectionDeleteIcon
          disabled={locked}
          handleClick={
            phoneNumber.id
              ? () => {
                  setFieldValue(
                    `phoneNumbers.${index}.destroy`,
                    !phoneNumber.destroy,
                  );
                }
              : () => {
                  const temp = phoneNumbers;
                  temp?.splice(index, 1);
                  setFieldValue('phoneNumbers', temp);
                }
          }
        />
      </Grid>
    </ModalSectionContainer>
  );
};
