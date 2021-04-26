import { ContactFiltersQuery } from '../../Contacts/ContactFilters/ContactFilters.generated';

export type FilterGroup = ContactFiltersQuery['contactFilters'][0];
export type Filter = FilterGroup['filters'][0];
export type FilterOption = Filter['options'][0];
