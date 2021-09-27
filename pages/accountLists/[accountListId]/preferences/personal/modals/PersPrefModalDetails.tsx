import { Grid, styled } from '@material-ui/core';
import { PersPrefField } from '../shared/PersPrefForms';
import { info } from '../DemoContent';
import { SectionHeading, StyledGridContainer } from './PersPrefModalShared';

const StyledGridContainerMobile = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down('xs')]: {
    marginBottom: theme.spacing(1),
  },
}));

interface DateSelectionProps {
  month: string;
  day: string;
  year: string;
}

const DateSelection: React.FC<DateSelectionProps> = ({ month, day, year }) => {
  return (
    <StyledGridContainer container spacing={2}>
      <Grid item xs={12} sm={6}>
        <PersPrefField
          label="Month"
          type="select"
          options={[
            ['number:1', 'January'],
            ['number:2', 'February'],
            ['number:3', 'March'],
            ['number:4', 'April'],
            ['number:5', 'May'],
            ['number:6', 'June'],
            ['number:7', 'July'],
            ['number:8', 'August'],
            ['number:9', 'September'],
            ['number:10', 'October'],
            ['number:11', 'November'],
            ['number:12', 'December'],
          ]}
          selectValue={`number:${month}`}
        />
      </Grid>
      <Grid item xs={12} sm={2}>
        <PersPrefField label="Day" inputType="number" inputValue={day} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <PersPrefField label="Year" inputType="number" inputValue={year} />
      </Grid>
    </StyledGridContainer>
  );
};

export const PersPrefModalDetails: React.FC = () => (
  <Grid container spacing={2}>
    <Grid item xs={12} sm={6}>
      <PersPrefField
        label="Legal First Name"
        inputValue={info.legal_first_name}
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <PersPrefField
        label="Gender"
        type="select"
        options={[
          ['unspecified', 'Unspecified'],
          ['male', 'Male'],
          ['female', 'Female'],
        ]}
        selectValue={info.gender}
      />
    </Grid>
    <StyledGridContainerMobile item xs={12} md={6}>
      <SectionHeading gutterBottom>Birthday</SectionHeading>
      <DateSelection
        month={info.birthday_month}
        day={info.birthday_day}
        year={info.birthday_year}
      />
    </StyledGridContainerMobile>
    <StyledGridContainerMobile item xs={12} md={6}>
      <SectionHeading gutterBottom>Anniversary</SectionHeading>
      <DateSelection
        month={info.anniversary_month}
        day={info.anniversary_day}
        year={info.anniversary_year}
      />
    </StyledGridContainerMobile>
    <Grid item xs={12}>
      <PersPrefField label="Alma Mater" inputValue={info.alma_mater} />
    </Grid>
  </Grid>
);
