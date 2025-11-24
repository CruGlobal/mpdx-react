import React from 'react';
import { List, ListItemButton, ListItemText, styled } from '@mui/material';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: 0,
  paddingLeft: theme.spacing(3),
}));

export const SectionList: React.FC = () => {
  const { sectionOrder, selectedSection, setSectionIndex } =
    useAdditionalSalaryRequest();

  return (
    <List disablePadding>
      {sectionOrder.map((section, index) => {
        const active = selectedSection === section;
        return (
          <StyledListItemButton
            key={section.section}
            aria-current={active}
            selected={active}
            onClick={() => setSectionIndex(index)}
          >
            <ListItemText
              primary={`${index + 1}. ${section.title}`}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </StyledListItemButton>
        );
      })}
    </List>
  );
};
