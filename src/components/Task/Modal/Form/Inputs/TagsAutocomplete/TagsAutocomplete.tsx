import { Autocomplete, Chip, CircularProgress, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTagOptionsQuery } from './TagsAutocomplete.generated';

export enum TagTypeEnum {
  Contact = 'Contact',
  Tag = 'Tag',
}

interface TagsAutocompleteProps {
  accountListId: string;
  type: TagTypeEnum;
  value: string[];
  onChange: (tagList: string[]) => void;
  label?: string;
}

export const TagsAutocomplete: React.FC<TagsAutocompleteProps> = ({
  accountListId,
  type,
  value,
  onChange,
  label,
}) => {
  const { t } = useTranslation();

  const { data, loading } = useTagOptionsQuery({
    variables: {
      accountListId,
      contact: type === TagTypeEnum.Contact,
    },
  });
  // Because of the @skip and @include directives, only contactTagList or taskTagList will be populated, but not both
  const options =
    data?.accountList.contactTagList ?? data?.accountList.taskTagList ?? [];

  return (
    <Autocomplete
      multiple
      openOnFocus
      autoSelect
      freeSolo
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            color="default"
            size="small"
            key={index}
            label={option}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label || t('Tags')}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress color="primary" size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      onChange={(event, newValue) => {
        if (event.type === 'blur' && newValue.length < value.length) {
          // Prevent tabbing out of the field from deselecting an item, while still
          // allowing tab to select the highlighted item
          return;
        }

        onChange(newValue);
      }}
      value={value}
      options={options}
    />
  );
};
