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
    textMessage: text_message,
    startDate,
    endDate,
  };
};
export { getAccountListAnalytics };
