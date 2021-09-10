import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  styled,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { accordionShared } from '../shared/PersPrefShared';
import { PersPrefContact } from './PersPrefContact';

const StyledAccordion = styled(Accordion)({
  '&.Mui-expanded': {
    margin: 0,
  },
  ...accordionShared,
});

const StyledAccordionSummary = styled(AccordionSummary)({
  display: 'inline-block',
  padding: 0,
  minHeight: 'unset',
  '& .MuiAccordionSummary-content': {
    display: 'inline-block',
    margin: 0,
  },
  '& .MuiAccordionSummary-expandIcon': {
    padding: 0,
    position: 'relative',
    top: '-3px',
  },
});

const StyledAccordionDetails = styled(AccordionDetails)({
  display: 'block',
  padding: 0,
});

export const PersPrefContacts = ({ data }) => {
  const dataValid = data.filter((current) => current.invalid !== true);
  const primaryIndex = dataValid.findIndex(
    (current) => current.primary === true,
  );
  const dataSansPrimary = dataValid.filter(
    (current, index) => index !== primaryIndex,
  );

  return (
    <>
      {dataValid.length === 1 && <PersPrefContact data={dataValid[0]} />}
      {dataValid.length > 1 && (
        <StyledAccordion>
          <StyledAccordionSummary expandIcon={<ExpandMore />}>
            <PersPrefContact data={dataValid[primaryIndex]} />
          </StyledAccordionSummary>
          <StyledAccordionDetails>
            {dataSansPrimary.map((current) => {
              return <PersPrefContact data={current} key={current.value} />;
            })}
          </StyledAccordionDetails>
        </StyledAccordion>
      )}
    </>
  );
};
