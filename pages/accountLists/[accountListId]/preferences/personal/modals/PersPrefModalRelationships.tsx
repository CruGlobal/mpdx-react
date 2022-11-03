import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DialogActions,
  DialogContent,
  Grid,
  Hidden,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AddCircle, Search } from '@mui/icons-material';
import Modal from '../../../../../../src/components/common/Modal/Modal';
import {
  PersPrefFieldWrapper,
  StyledOutlinedInput,
  StyledSelect,
} from '../shared/PersPrefForms';
import { info } from '../DemoContent';
import {
  AddButtonBox,
  DeleteButton,
  OptionHeadings,
  SectionHeading,
  StyledGridContainer,
  StyledGridItem,
} from './PersPrefModalShared';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';

const AddRelationshipButton = styled(Button)({
  fontSize: 16,
  padding: '17.5px 14px',
  lineHeight: 1.1876,
});

interface RelationshipModalProps {
  isOpen: boolean;
  handleOpen: (val: boolean) => void;
}

const RelationshipModal: React.FC<RelationshipModalProps> = ({
  isOpen,
  handleOpen,
}) => {
  const { t } = useTranslation();

  const handleClose = () => {
    handleOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      title={t('Person')}
      handleClose={handleClose}
    >
      <form>
        <DialogContent dividers>
          <PersPrefFieldWrapper labelText={t('Select Person')}>
            <StyledOutlinedInput startAdornment={<Search />} />
          </PersPrefFieldWrapper>
        </DialogContent>
        <DialogActions>
          <CancelButton onClick={handleClose} />
          <SubmitButton>
            {t('Save')}
          </SubmitButton>
        </DialogActions>
      </form>
    </Modal>
  );
};

interface AddRelationshipProps {
  relationship?: {
    name: string;
    relation: string;
  };
}

const AddRelationship: React.FC<AddRelationshipProps> = ({
  relationship = null,
}) => {
  const { t } = useTranslation();
  const [relationshipOpen, setRelationshipOpen] = useState(false);

  const handleOpen = () => {
    setRelationshipOpen(true);
  };

  const relations = [
    t('Husband'),
    t('Son'),
    t('Father'),
    t('Brother'),
    t('Uncle'),
    t('Newphew'),
    t('Cousin Male'),
    t('Grandfather'),
    t('Grandson'),
    t('Wife'),
    t('Daughter'),
    t('Mother'),
    t('Sister'),
    t('Aunt'),
    t('Niece'),
    t('Cousin Female'),
    t('Grandmother'),
    t('Granddaughter'),
  ];

  return (
    <StyledGridContainer container spacing={2}>
      <Grid item xs={12} sm={7}>
        {!relationship ? (
          <>
            <AddRelationshipButton
              variant="outlined"
              onClick={handleOpen}
              fullWidth
              disableRipple
            >
              Select Person
            </AddRelationshipButton>
            <RelationshipModal
              isOpen={relationshipOpen}
              handleOpen={setRelationshipOpen}
            />
          </>
        ) : (
          <PersPrefFieldWrapper formControlDisabled={true}>
            <StyledOutlinedInput value={relationship.name} />
          </PersPrefFieldWrapper>
        )}
      </Grid>
      <Grid item xs={12} sm={4}>
        <PersPrefFieldWrapper>
          <StyledSelect value={relationship ? relationship.relation : ''}>
            {relations.map((relation) => (
              <MenuItem value={relation} key={relation}>
                {relation}
              </MenuItem>
            ))}
          </StyledSelect>
        </PersPrefFieldWrapper>
      </Grid>
      <StyledGridItem item xs={12} sm={1}>
        <DeleteButton />
      </StyledGridItem>
    </StyledGridContainer>
  );
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

export const PersPrefModalRelationships: React.FC = () => {
  const { t } = useTranslation();

  const statuses = [
    t('Single'),
    t('Engaged'),
    t('Married'),
    t('Separated'),
    t('Divorced'),
    t('Widowed'),
  ];

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <PersPrefFieldWrapper labelText={t('Occupation')}>
            <StyledOutlinedInput value={info.occupation} />
          </PersPrefFieldWrapper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <PersPrefFieldWrapper labelText={t('Employer')}>
            <StyledOutlinedInput value={info.employer} />
          </PersPrefFieldWrapper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <PersPrefFieldWrapper labelText={t('Relationship Status')}>
            <StyledSelect value={info.marital_status}>
              {statuses.map((status) => (
                <MenuItem value={status} key={status}>
                  {status}
                </MenuItem>
              ))}
            </StyledSelect>
          </PersPrefFieldWrapper>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <StyledGrid item xs={12} sm={7}>
          <SectionHeading>{t('Relationships')}</SectionHeading>
        </StyledGrid>
        <Hidden xsDown>
          <OptionHeadings smallCols={4} align="flex-start">
            {t('Type')}
          </OptionHeadings>
          <OptionHeadings smallCols={1}>{t('Delete')}</OptionHeadings>
        </Hidden>
      </Grid>
      {info.family_relationships.map((relationship, index) => (
        <AddRelationship relationship={relationship} key={index} />
      ))}
      <AddRelationship />
      <AddButtonBox>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddCircle />}
          disableRipple
        >
          {t('Add Relationship')}
        </Button>
      </AddButtonBox>
    </>
  );
};
