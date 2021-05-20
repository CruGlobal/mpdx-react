import {
  ContactFilter,
  ContactFilterGroup,
  ContactFilterOption,
} from '../../../../graphql/types.generated';

const getContactFilters = (
  data: {
    id: string;
    type: string;
    attributes: {
      type: string;
      default_selection: string | boolean;
      featured: boolean;
      multiple: boolean;
      name: string;
      options: ContactFilterOption[];
      parent: string;
      title: string;
    };
  }[],
): ContactFilterGroup[] => {
  const groups: { [name: string]: ContactFilterGroup } = {};
  const createFilterGroup: (parent: string) => ContactFilterGroup = (
    parent,
  ) => {
    return {
      id: parent,
      title: parent,
      alwaysVisible: false,
      filters: [],
    };
  };

  const response: ContactFilterGroup[] = [];
  data.forEach(
    ({
      id,
      attributes: { default_selection, parent, title, ...attributes },
    }) => {
      const filter: ContactFilter = {
        id: id,
        title: title,
        ...attributes,
        defaultSelection:
          typeof default_selection === 'string'
            ? default_selection.split(/,\s?/)
            : [default_selection.toString()],
      };

      if (parent) {
        if (!groups[parent]) {
          groups[parent] = createFilterGroup(parent);
          response.push(groups[parent]);
        }
        groups[parent].filters.push(filter);
      } else {
        const group = createFilterGroup(title);
        response.push(group);
        group.filters.push(filter);
      }
    },
  );
  return response;
};

export default getContactFilters;
