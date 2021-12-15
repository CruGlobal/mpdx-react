import { ApolloServer } from '@saeris/apollo-server-vercel';
import { NextApiRequest } from 'next';
import {
  RequestOptions,
  Response,
  RESTDataSource,
} from 'apollo-datasource-rest';
import { DateTime, Duration, Interval } from 'luxon';
import {
  ExportFormatEnum,
  ExportLabelTypeEnum,
  ExportSortEnum,
} from '../../graphql/types.generated';
import { FourteenMonthReportCurrencyType } from './graphql-rest.page.generated';
import schema from './Schema';
import { getTaskAnalytics } from './Schema/TaskAnalytics/dataHandler';
import {
  CoachingAnswerSetData,
  CoachingAnswerSetIncluded,
  getCoachingAnswerSets,
} from './Schema/CoachingAnswerSets/dataHandler';
import {
  FourteenMonthReportResponse,
  mapFourteenMonthReport,
} from './Schema/reports/fourteenMonth/datahandler';
import {
  ExpectedMonthlyTotalResponse,
  mapExpectedMonthlyTotalReport,
} from './Schema/reports/expectedMonthlyTotal/datahandler';
import {
  DesignationAccountsResponse,
  createDesignationAccountsGroup,
  setActiveDesignationAccount,
} from './Schema/reports/designationAccounts/datahandler';
import {
  FinancialAccountResponse,
  setActiveFinancialAccount,
} from './Schema/reports/financialAccounts/datahandler';
import {
  createEntryHistoriesGroup,
  EntryHistoriesResponse,
} from './Schema/reports/entryHistories/datahandler';
import { getAccountListAnalytics } from './Schema/AccountListAnalytics/dataHandler';
import { getAppointmentResults } from './Schema/reports/appointmentResults/dataHandler';
import {
  DeleteCommentResponse,
  DeleteComment,
} from './Schema/Tasks/Comments/DeleteComments/datahandler';
import {
  UpdateCommentResponse,
  UpdateComment,
} from './Schema/Tasks/Comments/UpdateComments/datahandler';

class MpdxRestApi extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = process.env.REST_API_URL;
  }

  willSendRequest(request: RequestOptions) {
    request.headers.set('Authorization', this.context.authHeader);
    request.headers.set('content-type', 'application/vnd.api+json');
  }

  // Overridden to accept JSON API Content Type application/vnd.api+json
  // Taken from https://github.com/apollographql/apollo-server/blob/baf9b252dfab150ec828ef83345a7ceb2d34a6a3/packages/apollo-datasource-rest/src/RESTDataSource.ts#L110-L126
  protected parseBody(
    response: Response,
  ): Promise<Record<string, unknown> | string> {
    const contentType = response.headers.get('Content-Type');
    const contentLength = response.headers.get('Content-Length');
    if (
      // As one might expect, a "204 No Content" is empty! This means there
      // isn't enough to `JSON.parse`, and trying will result in an error.
      response.status !== 204 &&
      contentLength !== '0' &&
      contentType &&
      (contentType.startsWith('application/json') ||
        contentType.startsWith('application/vnd.api+json') ||
        contentType.startsWith('application/hal+json'))
    ) {
      return response.json();
    } else {
      return response.text();
    }
  }

  async createExportedContacts(
    mailing: boolean,
    format: ExportFormatEnum,
    filter: {
      account_list_id: string;
      newsletter: string;
      status: string;
    },
    labelType?: ExportLabelTypeEnum | null,
    sort?: ExportSortEnum | null,
  ) {
    const pathAddition = mailing ? '/mailing' : '';

    const { data } = await this.post(`contacts/exports${pathAddition}`, {
      data: {
        attributes: {
          params: {
            filter,
            type: labelType,
            sort,
          },
        },
        type: 'export_logs',
      },
    });

    return `${process.env.REST_API_URL}contacts/exports${pathAddition}/${data.id}.${format}`;
  }

  async getAccountListAnalytics(
    accountListId: string,
    dateRange?: string | null,
  ) {
    const { data } = await this.get(
      dateRange
        ? `account_lists/${accountListId}/analytics?filter[date_range]=${dateRange}`
        : `account_lists/${accountListId}/analytics`,
    );

    return getAccountListAnalytics(data);
  }

  async getAppointmentResults(
    accountListId: string,
    endDate: string,
    range: string,
  ) {
    const { data } = await this.get(
      `reports/appointment_results?filter[account_list_id]=${accountListId}&filter[end_date]=${endDate}&filter[range]=${range}`,
    );

    return getAppointmentResults(data);
  }

  async getTaskAnalytics(accountListId: string) {
    const { data } = await this.get(
      `tasks/analytics?filter[account_list_id]=${accountListId}`,
    );

    return getTaskAnalytics(data);
  }

  async getCoachingAnswerSets(
    accountListId: string,
    completed?: boolean | null,
  ) {
    const {
      data,
      included,
    }: {
      data: CoachingAnswerSetData;
      included: CoachingAnswerSetIncluded;
    } = await this.get(
      `coaching/answer_sets?filter[account_list_id]=${accountListId}&filter[completed]=${
        completed || false
      }&include=answers,questions&sort=-completed_at`,
    );

    return getCoachingAnswerSets(data, included);
  }

  async getFourteenMonthReport(
    accountListId: string,
    currencyType: FourteenMonthReportCurrencyType,
  ) {
    const { data }: { data: FourteenMonthReportResponse } = await this.get(
      `reports/${
        currencyType === 'salary'
          ? 'salary_currency_donations'
          : 'donor_currency_donations'
      }?filter[account_list_id]=${accountListId}&filter[month_range]=${Interval.before(
        DateTime.now().endOf('month'),
        Duration.fromObject({ months: 14 }).minus({ day: 1 }),
      )
        .toISODate()
        .replace('/', '...')}`,
    );
    return mapFourteenMonthReport(data, currencyType);
  }

  async getExpectedMonthlyTotalReport(accountListId: string) {
    const { data }: { data: ExpectedMonthlyTotalResponse } = await this.get(
      `reports/expected_monthly_totals?filter[account_list_id]=${accountListId}`,
    );
    return mapExpectedMonthlyTotalReport(data);
  }

  async getDesignationAccounts(accountListId: string) {
    const { data }: { data: DesignationAccountsResponse[] } = await this.get(
      `account_lists/${accountListId}/designation_accounts?per_page=10000`,
    );
    return createDesignationAccountsGroup(data);
  }

  async setDesignationAccountActive(
    accountListId: string,
    active: boolean,
    designationAccountId: string,
  ) {
    const { data }: { data: DesignationAccountsResponse } = await this.put(
      `account_lists/${accountListId}/designation_accounts/${designationAccountId}`,
      {
        data: {
          attributes: {
            active,
            overwrite: true,
          },
          id: designationAccountId,
          type: 'designation_accounts',
        },
      },
    );
    return setActiveDesignationAccount(data);
  }

  async setActiveFinancialAccount(
    accountListId: string,
    active: boolean,
    financialAccountId: string,
  ) {
    const { data }: { data: FinancialAccountResponse } = await this.put(
      `account_lists/${accountListId}/financial_accounts/${financialAccountId}`,
      {
        data: {
          attributes: {
            active,
            overwrite: true,
          },
          id: financialAccountId,
          type: 'financial_accounts',
        },
      },
    );
    return setActiveFinancialAccount(data);
  }

  async deleteComment(taskId: string, commentId: string) {
    const { data }: { data: DeleteCommentResponse } = await this.delete(
      `tasks/${taskId}/comments/${commentId}`,
    );
    return DeleteComment({ ...data, id: commentId });
  }

  async getEntryHistories(
    accountListId: string,
    financialAccountIds: Array<string>,
  ) {
    return await Promise.all(
      financialAccountIds.map((financialAccountId) =>
        this.get(
          `reports/entry_histories?filter[account_list_id]=${accountListId}&filter[financial_account_id]=${financialAccountId}`,
        ),
      ),
    ).then((res) => {
      return res.map(({ data }: { data: EntryHistoriesResponse[] }, idx) => {
        return createEntryHistoriesGroup(data, financialAccountIds[idx]);
      });
    });
  }

  async updateComment(taskId: string, commentId: string, body: string) {
    const { data }: { data: UpdateCommentResponse } = await this.put(
      `tasks/${taskId}/comments/${commentId}`,
      {
        data: {
          type: 'comments',
          attributes: {
            body,
          },
        },
      },
    );
    return UpdateComment(data);
  }
}

export interface Context {
  authHeader: string;
  dataSources: { mpdxRestApi: MpdxRestApi };
}

const server = new ApolloServer({
  schema,
  dataSources: () => {
    return {
      mpdxRestApi: new MpdxRestApi(),
    };
  },
  context: ({ req }: { req: NextApiRequest }): Partial<Context> => {
    return { authHeader: req.headers.authorization };
  },
});

export default server.createHandler();
