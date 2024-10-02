import { AccountListAnalytics } from 'src/graphql/types.generated';

const getAccountListAnalytics = (data: {
  id: string;
  type: string;
  attributes: {
    appointments: {
      completed: number;
    };
    contacts: {
      active: number;
      referrals: number;
      referrals_on_hand: number;
    };
    correspondence: {
      precall: number;
      reminders: number;
      support_letters: number;
      thank_yous: number;
      newsletters: number;
    };
    created_at: string;
    electronic: {
      appointments: number;
      received: number;
      sent: number;
    };
    email: {
      received: number;
      sent: number;
    };
    end_date: string;
    facebook: {
      received: number;
      sent: number;
    };
    phone: {
      appointments: number;
      attempted: number;
      completed: number;
      received: number;
      talktoinperson: number;
    };
    start_date: string;
    text_message: {
      received: number;
      sent: number;
    };
    updated_at: string;
    updated_in_db_at: string;
    contacts_by_status: {
      never_contacted: number;
      future: number;
      cultivate: number;
      contact_for_appointment: number;
      appointment_scheduled: number;
      call_for_decision: number;
      financial: number;
      special: number;
      prayer: number;
      connections_remaining: number;
      initiations: number;
    };
  };
}): AccountListAnalytics => {
  const {
    attributes: {
      appointments,
      contacts,
      correspondence,
      electronic,
      email,
      facebook,
      phone,
      text_message,
      start_date: startDate,
      end_date: endDate,
      contacts_by_status,
    },
  } = data;

  return {
    appointments,
    contacts: {
      active: contacts.active,
      referrals: contacts.referrals,
      referralsOnHand: contacts.referrals_on_hand,
    },
    correspondence: {
      precall: correspondence.precall,
      reminders: correspondence.reminders,
      supportLetters: correspondence.support_letters,
      thankYous: correspondence.thank_yous,
      newsletters: correspondence.newsletters,
    },
    electronic,
    email,
    facebook,
    phone: {
      appointments: phone.appointments,
      attempted: phone.attempted,
      completed: phone.completed,
      received: phone.received,
      talkToInPerson: phone.talktoinperson,
    },
    contactsByStatus: {
      neverContacted: contacts_by_status.never_contacted,
      future: contacts_by_status.future,
      cultivate: contacts_by_status.cultivate,
      contactForAppointment: contacts_by_status.contact_for_appointment,
      appointmentScheduled: contacts_by_status.appointment_scheduled,
      callForDecision: contacts_by_status.call_for_decision,
      financial: contacts_by_status.financial,
      special: contacts_by_status.special,
      prayer: contacts_by_status.prayer,
      connectionsRemaining: contacts_by_status.connections_remaining,
      initiations: contacts_by_status.initiations,
    },
    textMessage: text_message,
    startDate,
    endDate,
  };
};
export { getAccountListAnalytics };
