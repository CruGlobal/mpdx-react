import { AccountListAnalytics } from "graphql/types.generated";



const getAccountListAnalytics = (data: {
    id: string;
    type: string;
    attributes: {
        appointments: {
            completed: number
        },
        contacts: {
            active: number,
            referrals: number,
            referrals_on_hand: number
        },
        correspondence: {
            precall: number,
            reminders: number,
            support_letters: number,
            thank_yous: number,
            newsletters: number
        },
        created_at: string,
        electronic: {
            appointments: number;
            received: number,
            sent: number
        },
        email: {
            received: number,
            sent: number
        },
        end_date: string,
        facebook: {
            received: number,
            sent: number
        },
        phone: {
            appointments: number,
            attempted: number,
            completed: number,
            received: number,
            talktoinperson: number
        },
        start_date: string,
        text_message: {
            received: number,
            sent: number
        },
        updated_at: string,
        updated_in_db_at: string
    }
}): AccountListAnalytics => {
    const {
        attributes: {
            created_at,
            appointments,
            contacts,
            correspondence,
            electronic,
            email,
            facebook,
            phone,
            text_message,
            start_date,
            end_date,
            updated_at,
            updated_in_db_at,
        }

    } = data;

    return {
        ...data,
        createdAt: created_at,
        appointments: appointments,
        contacts: contacts,
        correspondence: correspondence,
        electronic: electronic,
        email: email,
        facebook: facebook,
        phone: phone,
        textMessage: text_message,
        startDate: start_date,
        endDate: end_date,
        updatedAt: updated_at,
        updatedInDbAt: updated_in_db_at,

    }
}
export { getAccountListAnalytics }