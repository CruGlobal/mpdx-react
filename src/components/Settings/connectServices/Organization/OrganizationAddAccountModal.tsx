import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogActions, Autocomplete, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/system';
import Modal from 'src/components/common/Modal/Modal';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { useGetOrganizationsQuery } from './Organizations.generated';

interface OrganizationAddAccountModalProps {
  handleClose: () => void;
}

const StyledBox = styled(Box)(() => ({
  padding: '0 10px',
}));

export const OrganizationAddAccountModal: React.FC<
  OrganizationAddAccountModalProps
> = ({ handleClose }) => {
  const { t } = useTranslation();
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const { data: organizations, loading } = useGetOrganizationsQuery();

  const handleSubmit = () => {
    if (!selectedOrganization) {
      // TODO - Handle Error
      return;
    }
    // TODO - Update GraphQL
    setSelectedOrganization('');
    handleClose();
  };

  const handleAutoCompleteChange = (_, value) => {
    if (value) setSelectedOrganization(value);
  };

  return (
    <Modal
      isOpen={true}
      title={t('Add Organization Account')}
      handleClose={handleClose}
      size={'sm'}
    >
      <form onSubmit={handleSubmit}>
        <StyledBox>
          <FieldWrapper labelText={t('Organization')}>
            <Autocomplete
              autoSelect
              autoHighlight
              loading={loading}
              value={selectedOrganization}
              onChange={handleAutoCompleteChange}
              options={organizations?.organizations?.map(({ id }) => id) || []}
              getOptionLabel={(option) =>
                organizations?.organizations?.find(
                  ({ id }) => String(id) === String(option),
                )?.name ?? ''
              }
              filterSelectedOptions
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={'Organization'}
                  label={'Organizations'}
                  data-testid="multiSelectFilter"
                />
              )}
            />
          </FieldWrapper>
        </StyledBox>
        <DialogActions>
          <CancelButton onClick={handleClose} />
          <SubmitButton>{t('Add Account')}</SubmitButton>
        </DialogActions>
      </form>
    </Modal>
  );
};
