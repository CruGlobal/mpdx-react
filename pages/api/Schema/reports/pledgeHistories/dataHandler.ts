import { ReportsPledgeHistories } from 'src/graphql/types.generated';

const getReportsPledgeHistories = (
  data: [
    {
      id: string;
      attributes: {
        created_at: string;
        end_date: string;
        pledged: number;
        received: number;
        start_date: string;
        updated_at: string;
        updated_in_db_at: string;
      };
    },
  ],
): ReportsPledgeHistories[] => {
  const reportsPledgeHistories: ReportsPledgeHistories[] = data
    .map((histories) => {
      const {
        id,
        attributes: {
          end_date,
          pledged,
          received,
          start_date,
          updated_at,
          updated_in_db_at,
        },
      } = histories;
      return {
        id: id,
        endDate: end_date,
        pledged: pledged,
        received: received,
        startDate: start_date,
        updatedAt: updated_at,
        updatedInDbAt: updated_in_db_at,
      };
    })
    .sort((item1, item2) => {
      if (item1.startDate < item2.startDate) {
        return -1;
      } else if (item1.startDate > item2.startDate) {
        return 1;
      } else {
        return 0;
      }
    });
  return reportsPledgeHistories;
};

export { getReportsPledgeHistories };
