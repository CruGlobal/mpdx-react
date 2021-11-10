import {
  ContactFilterStatusEnum,
  DaterangeFilter,
  MultiselectFilter,
  TextFilter,
} from '../../../../graphql/types.generated';

export const mockDateRangeFilter: DaterangeFilter = {
  __typename: 'DaterangeFilter',
  featured: false,
  filterKey: 'daterange',
  title: 'Date Range',
  options: [],
};
export const mockMultiselectFilterNonFeatured: MultiselectFilter = {
  __typename: 'MultiselectFilter',
  featured: false,
  filterKey: 'status',
  title: 'Status',
  options: [
    {
      name: 'Contact for Appointment',
      value: ContactFilterStatusEnum.ContactForAppointment,
    },
    {
      name: 'Appointment Scheduled',
      value: ContactFilterStatusEnum.AppointmentScheduled,
    },
  ],
};
export const mockMultiselectFilterFeatured: MultiselectFilter = {
  __typename: 'MultiselectFilter',
  featured: true,
  filterKey: 'multiselect',
  title: 'MultiSelect',
  options: [
    { name: 'Option1', value: 'option1' },
    { name: 'Option2', value: 'option2' },
  ],
};
export const mockTextFilter: TextFilter = {
  __typename: 'TextFilter',
  featured: false,
  filterKey: 'text',
  title: 'Text',
  options: [],
};
