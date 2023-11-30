import { ReportsAppointmentResultsPeriod } from '../../../../../graphql/types.generated';

const getAppointmentResults = (
  data: [
    {
      id: string;
      type: string;
      attributes: {
        appointments_scheduled: number;
        end_date: string;
        group_appointments: number;
        individual_appointments: number;
        monthly_decrease: number;
        monthly_increase: number;
        new_monthly_partners: number;
        new_special_pledges: number;
        pledge_increase: string;
        special_gifts: number;
        start_date: string;
        weekly_individual_appointment_goal: number;
      };
    },
  ],
): ReportsAppointmentResultsPeriod[] => {
  const appointmentResultsPeriods: ReportsAppointmentResultsPeriod[] = data
    .map((resultPeriod) => {
      const {
        id,
        type,
        attributes: {
          appointments_scheduled,
          end_date,
          group_appointments,
          individual_appointments,
          monthly_decrease,
          monthly_increase,
          new_monthly_partners,
          new_special_pledges,
          pledge_increase,
          special_gifts,
          start_date,
          weekly_individual_appointment_goal,
        },
      } = resultPeriod;
      return {
        id: id,
        type: type,
        appointmentsScheduled: appointments_scheduled,
        endDate: end_date,
        groupAppointments: group_appointments,
        individualAppointments: individual_appointments,
        monthlyDecrease: monthly_decrease,
        monthlyIncrease: monthly_increase,
        newMonthlyPartners: new_monthly_partners,
        newSpecialPledges: new_special_pledges,
        pledgeIncrease: Number(pledge_increase),
        specialGifts: special_gifts,
        startDate: start_date,
        weeklyIndividualAppointmentGoal: weekly_individual_appointment_goal,
      };
    })
    .reverse();
  return appointmentResultsPeriods;
};

export { getAppointmentResults };
