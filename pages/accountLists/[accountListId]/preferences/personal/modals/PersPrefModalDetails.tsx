import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Info } from 'luxon';
import {
  PersPrefFieldWrapper,
  StyledOutlinedInput,
  StyledSelect,
} from '../shared/PersPrefForms';
import { info } from '../DemoContent';
import { SectionHeading, StyledGridContainer } from './PersPrefModalShared';

const StyledGridContainerMobile = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down('xs')]: {
    marginBottom: theme.spacing(1),
  },
}));

interface DateSelectionProps {
  month: number;
  day: number;
  year: number;
}

const DateSelection: React.FC<DateSelectionProps> = ({ month, day, year }) => {
  const { t } = useTranslation();

  const months = Info.monthsFormat('long');

  return (
    <StyledGridContainer container spacing={2}>
      <Grid item xs={12} sm={6}>
        <PersPrefFieldWrapper labelText={t('Month')}>
          <StyledSelect value={`number:${month}`}>
            {months.map((current, index) => (
              <MenuItem value={`number:${index + 1}`} key={current}>
                {t(current)}
              </MenuItem>
            ))}
          </StyledSelect>
        </PersPrefFieldWrapper>
      </Grid>
      <Grid item xs={12} sm={2}>
        <PersPrefFieldWrapper labelText={t('Day')}>
          <StyledOutlinedInput value={day} type="number" />
        </PersPrefFieldWrapper>
      </Grid>
      <Grid item xs={12} sm={4}>
        <PersPrefFieldWrapper labelText={t('Year')}>
          <StyledOutlinedInput value={year} type="number" />
        </PersPrefFieldWrapper>
      </Grid>
    </StyledGridContainer>
  );
};

export const PersPrefModalDetails: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <PersPrefFieldWrapper labelText={t('Legal First Name')}>
          <StyledOutlinedInput value={info.legal_first_name} />
        </PersPrefFieldWrapper>
      </Grid>
      <Grid item xs={12} sm={6}>
        <PersPrefFieldWrapper labelText={t('Gender')}>
          <StyledSelect value={info.gender}>
            <MenuItem value="unspecified">Unspecified</MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
          </StyledSelect>
        </PersPrefFieldWrapper>
      </Grid>
      <StyledGridContainerMobile item xs={12} md={6}>
        <SectionHeading gutterBottom>{t('Birthday')}</SectionHeading>
        <DateSelection
          month={info.birthday_month}
          day={info.birthday_day}
          year={info.birthday_year}
        />
      </StyledGridContainerMobile>
      <StyledGridContainerMobile item xs={12} md={6}>
        <SectionHeading gutterBottom>{t('Anniversary')}</SectionHeading>
        <DateSelection
          month={info.anniversary_month}
          day={info.anniversary_day}
          year={info.anniversary_year}
        />
      </StyledGridContainerMobile>
      <Grid item xs={12}>
        <PersPrefFieldWrapper labelText={t('Alma Mater')}>
          <StyledOutlinedInput value={info.alma_mater} />
        </PersPrefFieldWrapper>
      </Grid>
    </Grid>
  );
};
