import React from 'react';
import { List, ListItemButton, ListItemText, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { sectionOrder } from '../AdditionalSalaryRequestHelper';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: 0,
  paddingLeft: theme.spacing(3),
}));

export const SectionList: React.FC = () => {
  const { selectedSection, setSelectedSection } = useAdditionalSalaryRequest();
  const { t } = useTranslation();

  return (
    <List disablePadding>
      {sectionOrder.map((section, i) => {
        const active = selectedSection === section;
        return (
          <StyledListItemButton
            key={section.section}
            aria-current={active}
            selected={active}
            onClick={() => setSelectedSection(section)}
          >
            <ListItemText
              primary={`${i + 1}. ${t(section.title)}`}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </StyledListItemButton>
        );
      })}
    </List>
  );
};
