import React, { ReactElement } from 'react';
import { Autocomplete, AutocompleteProps } from '@mui/material';

interface TagsAutocompleteProps
  extends Partial<AutocompleteProps<any, boolean, boolean, boolean>> {
  tags: any;
  inputComponent: React.ComponentType<any>;
  textFieldPlaceholder?: string;
  textFieldVariant?: 'standard' | 'filled' | 'outlined';
  textFieldSize?: 'small' | 'medium';
  textFieldDisabled?: boolean;
}

export const TagsAutocomplete = ({
  tags,
  inputComponent,
  textFieldPlaceholder,
  textFieldVariant,
  textFieldSize,
  textFieldDisabled,
  ...props
}: TagsAutocompleteProps) => {
  return (
    <Autocomplete
      getOptionLabel={(option) => option}
      {...props}
      options={tags}
      renderInput={(params): ReactElement => {
        const InputComponent = inputComponent;
        return (
          <InputComponent
            {...params}
            variant={textFieldVariant}
            size={textFieldSize}
            placeholder={textFieldPlaceholder}
            disabled={textFieldDisabled}
            InputProps={{
              ...params.InputProps,
            }}
          />
        );
      }}
    />
  );
};
