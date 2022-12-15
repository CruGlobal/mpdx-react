import {
  ContactFilterStatusEnum,
  DaterangeFilter,
  MultiselectFilter,
  NumericRangeFilter,
  TextFilter,
} from '../../../../graphql/types.generated';

export const mockDateRangeFilter: DaterangeFilter = {
  __typename: 'DaterangeFilter',
  filterKey: 'daterange',
  title: 'Date Range',
  options: [],
};
export const mockMultiselectFilter: MultiselectFilter = {
  __typename: 'MultiselectFilter',
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
export const mockTextFilter: TextFilter = {
  __typename: 'TextFilter',
  filterKey: 'text',
  title: 'Text',
  options: [],
};

export const mockSliderFilter: NumericRangeFilter = {
  __typename: 'NumericRangeFilter',
  filterKey: 'donation_period_amount',
  title: 'Donation Amount',
  min: 10,
  max: 100,
  minLabel: 'Min',
  maxLabel: 'Max',
};
