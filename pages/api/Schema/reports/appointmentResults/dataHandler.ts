import { AppointmentResults } from '../../../../../graphql/types.generated';

const getAppointmentResults = (
  data: [
    {
      id: string;
      type: string;
      attributes: {
        appointments_scheduled: number;
        created_at: string;
        end_date: string;
        group_appointments: number;
        individual_appointments: number;
        monthly_decrease: number;
        monthly_increase: number;
        new_monthly_partners: number;
        new_special_pledges: number;
        pledge_increase: number;
        special_gifts: number;
        start_date: string;
        updated_at: string;
        updated_in_db_at: string;
        weekly_individual_appointment_goal: number;
      };
    },
  ],
): AppointmentResults => {
  return {
    ...data,
  };
};

export { getAppointmentResults };
