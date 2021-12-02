import { AccountListAnalytics } from "graphql/types.generated";


const getAccountListAnalytics = (data: {
    id: string;
    type: string;
    attributes: {
        created_at: string,
        start_date: string,
        end_date: string,
        updated_at: string,
        updated_in_db_at: string,
    }
}): AccountListAnalytics => {
    const {
        attributes: {
            created_at,
            start_date,
            end_date,
            updated_at,
            updated_in_db_at,
        }

    } = data;

    return {
        ...data,
        createdAt: created_at,
        startDate: start_date,
        endDate: end_date,
        updatedAt: updated_at,
        updatedInDbAt: updated_in_db_at,

    }
}
export { getAccountListAnalytics }