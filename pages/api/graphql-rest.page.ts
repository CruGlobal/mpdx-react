import { NextApiRequest } from 'next';
import { AugmentedRequest, RESTDataSource } from '@apollo/datasource-rest';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { GraphQLError } from 'graphql';
import Cors from 'micro-cors';
import {
  ExportFormatEnum,
  ExportLabelTypeEnum,
  ExportSortEnum,
  MergeContactsInput,
  MergePeopleBulkInput,
} from 'src/graphql/types.generated';
import { getTwelveMonthReportDateRange } from 'src/lib/dateRangeHelpers';
import schema from './Schema';
import { getAccountListAnalytics } from './Schema/AccountListAnalytics/dataHandler';
import { getAccountListCoaches } from './Schema/AccountListCoaches/dataHandler';
import { getAccountListDonorAccounts } from './Schema/AccountListDonorAccounts/dataHandler';
import {
  getCoachingAnswer,
  getCoachingAnswerSet,
  getCoachingAnswerSets,
} from './Schema/CoachingAnswerSets/dataHandler';
import { readExistingAddresses } from './Schema/ContactPrimaryAddress/datahandler';
import {
  DestroyDonorAccount,
  DestroyDonorAccountResponse,
} from './Schema/Contacts/DonorAccounts/Destroy/datahander';
import { SendToChalkline } from './Schema/Settings/Integrations/Chalkine/sendToChalkline/datahandler';
import { CreateGoogleIntegration } from './Schema/Settings/Integrations/Google/createGoogleIntegration/datahandler';
import { GoogleAccountIntegrations } from './Schema/Settings/Integrations/Google/googleAccountIntegrations/datahandler';
import {
  GoogleAccounts,
  GoogleAccountsResponse,
} from './Schema/Settings/Integrations/Google/googleAccounts/datahandler';
import { GoogleIntegrationResponse } from './Schema/Settings/Integrations/Google/parse';
import { SyncGoogleIntegration } from './Schema/Settings/Integrations/Google/syncGoogleIntegration/datahandler';
import { UpdateGoogleIntegration } from './Schema/Settings/Integrations/Google/updateGoogleIntegration/datahandler';
import {
  MailchimpAccount,
  MailchimpAccountResponse,
} from './Schema/Settings/Integrations/Mailchimp/mailchimpAccount/datahandler';
import { SyncMailchimpAccount } from './Schema/Settings/Integrations/Mailchimp/syncMailchimpAccount/datahandler';
import {
  UpdateMailchimpAccount,
  UpdateMailchimpAccountResponse,
} from './Schema/Settings/Integrations/Mailchimp/updateMailchimpAccount/datahandler';
import {
  PrayerlettersAccount,
  PrayerlettersAccountResponse,
} from './Schema/Settings/Integrations/Prayerletters/prayerlettersAccount/datahandler';
import { SyncPrayerlettersAccount } from './Schema/Settings/Integrations/Prayerletters/syncPrayerlettersAccount/datahandler';
import { CreateOrganizationInvite } from './Schema/Settings/Organizations/CreateOrganizationInvite/datahandler';
import {
  OrganizationAdmins,
  OrganizationAdminsResponse,
} from './Schema/Settings/Organizations/OrganizationAdmins/datahandler';
import { OrganizationInvites } from './Schema/Settings/Organizations/OrganizationInvites/datahandler';
import {
  Organizations,
  OrganizationsResponse,
} from './Schema/Settings/Organizations/Organizations/datahandler';
import {
  SearchOrganizationsAccountLists,
  SearchOrganizationsAccountListsResponse,
} from './Schema/Settings/Organizations/SearchOrganizationsAccountLists/datahandler';
import {
  SearchOrganizationsContacts,
  SearchOrganizationsContactsResponse,
} from './Schema/Settings/Organizations/SearchOrganizationsContacts/datahandler';
import {
  OrganizationInvite,
  OrganizationInvitesResponse,
} from './Schema/Settings/Organizations/helper';
import { canUserExportData } from './Schema/Settings/Preferences/CanUserExportData/dataHandler';
import { getTaskAnalytics } from './Schema/TaskAnalytics/dataHandler';
import {
  DeleteComment,
  DeleteCommentResponse,
} from './Schema/Tasks/Comments/DeleteComments/datahandler';
import {
  UpdateComment,
  UpdateCommentResponse,
} from './Schema/Tasks/Comments/UpdateComments/datahandler';
import {
  DonationReponseData,
  DonationReponseIncluded,
  getDesignationDisplayNames,
} from './Schema/donations/datahandler';
import { getAppointmentResults } from './Schema/reports/appointmentResults/dataHandler';
import {
  DesignationAccountsResponse,
  createDesignationAccountsGroup,
  setActiveDesignationAccount,
} from './Schema/reports/designationAccounts/datahandler';
import {
  EntryHistoriesResponse,
  createEntryHistoriesGroup,
} from './Schema/reports/entryHistories/datahandler';
import {
  ExpectedMonthlyTotalResponse,
  mapExpectedMonthlyTotalReport,
} from './Schema/reports/expectedMonthlyTotal/datahandler';
import {
  FinancialAccountResponse,
  setActiveFinancialAccount,
} from './Schema/reports/financialAccounts/datahandler';
import { financialAccountSummaryHandler } from './Schema/reports/financialAccounts/financialAccounts/datahandler';
import { financialAccountEntriesHandler } from './Schema/reports/financialAccounts/financialEntries/datahandler';
import { mapPartnerGivingAnalysisResponse } from './Schema/reports/partnerGivingAnalysis/datahandler';
import { getReportsPledgeHistories } from './Schema/reports/pledgeHistories/dataHandler';
import {
  TwelveMonthReportResponse,
  mapTwelveMonthReport,
} from './Schema/reports/twelveMonth/datahandler';
import {
  CoachingAnswerSet,
  ContactFilterNewsletterEnum,
  ContactFilterNotesInput,
  ContactFilterStatusEnum,
  DateRangeInput,
  NumericRangeInput,
  ReportContactFilterSetInput,
  TwelveMonthReportCurrencyType,
} from './graphql-rest.page.generated';
import type { FetcherResponse } from '@apollo/utils.fetcher';

const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

const DeleteDataHandler = () => ({
  success: true,
});

class MpdxRestApi extends RESTDataSource {
  authHeader: string;

  constructor(authHeader: string) {
    super();
    this.baseURL = process.env.REST_API_URL;
    this.authHeader = authHeader;
  }

  willSendRequest(path: string, request: AugmentedRequest) {
    request.headers['Authorization'] = this.authHeader;
    request.headers['Content-Type'] = 'application/vnd.api+json';
  }

  // Overridden to accept JSON API Content Type application/vnd.api+json
  // Taken from: https://github.com/apollographql/datasource-rest/blob/main/src/RESTDataSource.ts#L303-L319
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

  // parsedBody has the unknown type so we have to check that it is an object with the expected structure
  getRestError = (parsedBody: unknown) =>
    parsedBody &&
    typeof parsedBody === 'object' &&
    'errors' in parsedBody &&
    Array.isArray(parsedBody.errors)
      ? parsedBody.errors[0]
      : null;

  protected async errorFromResponse({
    response,
    parsedBody,
  }: {
    response: FetcherResponse;
    parsedBody: unknown;
  }): Promise<GraphQLError> {
    const error = await super.errorFromResponse({ response, parsedBody });
    const restError = this.getRestError(parsedBody);

    if (restError?.detail) {
      // Populate the error message with the message detail from the API
      error.message = restError.detail;
    }

    if (restError?.status === '404') {
      // Override the code when the error is a not found error from the REST API
      // so that client.ts can detect account list not found errors
      error.extensions.code = 'NOT_FOUND';
    }

    return error;
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
      body: {
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
      },
    });

    return `${process.env.REST_API_URL}contacts/exports${pathAddition}/${data.id}.${format}`;
  }

  async mergeContacts(
    winnersAndLosers: MergeContactsInput['winnersAndLosers'],
  ) {
    const response = await this.post('contacts/merges/bulk', {
      body: {
        data: winnersAndLosers.map((contact) => ({
          data: {
            type: 'contacts',
            attributes: {
              loser_id: contact.loserId,
              winner_id: contact.winnerId,
            },
          },
        })),
      },
    });

    // Return the id of the winners
    return response.map((contact) => contact.data.id);
  }

  async mergePeopleBulk(
    winnersAndLosers: MergePeopleBulkInput['winnersAndLosers'],
  ) {
    const response = await this.post('contacts/people/merges/bulk', {
      body: {
        data: winnersAndLosers.map((person) => ({
          data: {
            type: 'people',
            attributes: {
              loser_id: person.loserId,
              winner_id: person.winnerId,
            },
          },
        })),
      },
    });
    return response.map((person) => person.data.id);
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
    endDate: string | null | undefined,
    range: string,
  ) {
    const { data } = await this.get(
      `reports/appointment_results?filter[account_list_id]=${accountListId}&filter[range]=${range}` +
        (endDate ? `&filter[end_date]=${endDate}` : ''),
    );

    return getAppointmentResults(data);
  }

  async getReportPledgeHistories(
    accountListId: string,
    range: string | null | undefined,
    endDate: string | null | undefined,
  ) {
    const rangeFilter = range ? `&filter[range]=${range}` : '';
    const endDateFilter = endDate ? `&filter[end_date]=${endDate}` : '';
    const { data } = await this.get(
      `reports/pledge_histories?filter[account_list_id]=${accountListId}${rangeFilter}${endDateFilter}`,
    );
    return getReportsPledgeHistories(data);
  }

  async getTaskAnalytics(accountListId: string) {
    const { data } = await this.get(
      `tasks/analytics?filter[account_list_id]=${accountListId}`,
    );

    return getTaskAnalytics(data);
  }

  async getAccountListCoaches() {
    const { data } = await this.get(`user/account_list_coaches`);
    return getAccountListCoaches(data);
  }

  async getCoachingAnswerSets(
    accountListId: string,
    completed: boolean | null | undefined,
    multiple: boolean,
  ) {
    const response = await this.get(
      `coaching/answer_sets?filter[account_list_id]=${accountListId}&filter[completed]=${
        completed ?? false
      }${
        multiple ? '' : '&filter[limit]=1'
      }&include=answers,questions&sort=-completed_at`,
    );
    return getCoachingAnswerSets(response);
  }

  async getCurrentCoachingAnswerSet(
    accountListId: string,
    organizationId: string,
  ): Promise<CoachingAnswerSet> {
    // Try to find the first incomplete answer set
    const [answerSet] = await this.getCoachingAnswerSets(
      accountListId,
      false,
      false,
    );
    if (answerSet) {
      return answerSet;
    }

    // Create a new answer set
    const response = await this.post('coaching/answer_sets', {
      body: {
        data: {
          type: 'coaching_answer_sets',
          relationships: {
            account_list: {
              data: {
                type: 'account_lists',
                id: accountListId,
              },
            },
            organization: {
              data: {
                type: 'organizations',
                id: organizationId,
              },
            },
          },
        },
        include: 'answers,questions',
        fields: {
          coaching_answer_sets:
            'created_at,updated_at,completed_at,answers,questions',
          answers: 'response',
          questions: 'position,prompt,response_options,required',
        },
      },
    });
    return getCoachingAnswerSet(response);
  }

  async saveCoachingAnswer(
    answerSetId: string,
    questionId: string,
    answerId: string | null,
    response: string,
  ) {
    const body = {
      data: {
        type: 'coaching_answers',
        attributes: {
          response: response,
        },
      },
      include: 'question',
    };
    const res = answerId
      ? await this.put(`coaching/answers/${answerId}`, { body })
      : await this.post('coaching/answers', {
          body: {
            ...body,
            data: {
              ...body.data,
              relationships: {
                question: {
                  data: {
                    type: 'coaching_questions',
                    id: questionId,
                  },
                },
                answer_set: {
                  data: {
                    type: 'coaching_answer_sets',
                    id: answerSetId,
                  },
                },
              },
            },
          },
        });
    return getCoachingAnswer(res);
  }

  // TODO: This should be merged with the updateContact mutation by adding the ability to update
  // the primaryMailingAddress field when we have API resources again
  async setContactPrimaryAddress(
    contactId: string,
    primaryAddressId: string | null | undefined,
  ) {
    // Setting primary_mailing_address to true on one address doesn't set it to false on all the
    // others, so we have to load all the existing addresses and update all of their
    // primary_mailing_address attributes
    const getAddressesResponse = await this.get(
      `contacts/${contactId}?include=addresses`,
    );
    const addresses = readExistingAddresses(getAddressesResponse).map(
      (address) => ({
        ...address,
        primaryMailingAddress: address.id === primaryAddressId,
      }),
    );
    await this.put(`contacts/${contactId}`, {
      body: {
        included: addresses.map(({ id, primaryMailingAddress }) => ({
          type: 'addresses',
          id,
          attributes: {
            primary_mailing_address: primaryMailingAddress,
          },
        })),
        data: {
          type: 'contacts',
          id: contactId,
          attributes: { overwrite: true },
          relationships: {
            addresses: {
              data: addresses.map(({ id }) => ({
                type: 'addresses',
                id,
              })),
            },
          },
        },
      },
    });
    return {
      addresses,
    };
  }

  async getTwelveMonthReport(
    accountListId: string,
    designationAccountId: string[] | null | undefined,
    currencyType: TwelveMonthReportCurrencyType,
  ) {
    const designationAccountFilter =
      designationAccountId && designationAccountId.length > 0
        ? `&filter[designation_account_id]=${designationAccountId.join(',')}`
        : '';
    const { data }: { data: TwelveMonthReportResponse } = await this.get(
      `reports/${
        currencyType === 'salary'
          ? 'salary_currency_donations'
          : 'donor_currency_donations'
      }?filter[account_list_id]=${accountListId}${designationAccountFilter}&filter[month_range]=${getTwelveMonthReportDateRange()}`,
    );
    return mapTwelveMonthReport(data, currencyType);
  }

  async getExpectedMonthlyTotalReport(
    accountListId: string,
    designationAccountId: string[] | null | undefined,
  ) {
    const designationAccountFilter =
      designationAccountId && designationAccountId.length > 0
        ? `&filter[designation_account_id]=${designationAccountId.join(',')}`
        : '';
    const { data }: { data: ExpectedMonthlyTotalResponse } = await this.get(
      `reports/expected_monthly_totals?filter[account_list_id]=${accountListId}${designationAccountFilter}`,
    );
    return mapExpectedMonthlyTotalReport(data);
  }

  async getPartnerGivingAnalysis(
    accountListId: string,
    page: number,
    pageSize: number,
    sortField: string,
    sortAscending: boolean,
    contactFilters: ReportContactFilterSetInput | null | undefined,
  ) {
    // Adapted from src/components/Shared/Filters/FilterPanel.tsx
    // This code essentially does the reverse of the logic in setSelectedSavedFilter
    const filters: Record<
      string,
      string | number | boolean | NumericRangeInput | ContactFilterNotesInput
    > = {
      account_list_id: accountListId,
      any_tags: false,
    };
    Object.entries(contactFilters ?? {}).forEach(([key, value]) => {
      if (value === null) {
        return;
      }

      const snakedKey = camelToSnake(key);

      switch (key) {
        // Boolean
        case 'addressHistoric':
        case 'addressPrimary':
        case 'addressValid':
        case 'anyTags':
        case 'noAppeals':
        case 'pledgeReceived':
        case 'reverseAlmaMater':
        case 'reverseAppeal':
        case 'reverseChurch':
        case 'reverseCity':
        case 'reverseCountry':
        case 'reverseDesignationAccountId':
        case 'reverseDonation':
        case 'reverseDonationAmount':
        case 'reverseDonationPeriodAverage':
        case 'reverseDonationPeriodCount':
        case 'reverseDonationPeriodPercentRank':
        case 'reverseDonationPeriodSum':
        case 'reverseIds':
        case 'reverseLikely':
        case 'reverseLocale':
        case 'reverseMetroArea':
        case 'reversePledgeAmount':
        case 'reversePledgeCurrency':
        case 'reversePledgeFrequency':
        case 'reversePrimaryAddress':
        case 'reverseReferrer':
        case 'reverseRegion':
        case 'reverseRelatedTaskAction':
        case 'reverseSource':
        case 'reverseState':
        case 'reverseStatus':
        case 'reverseTimezone':
        case 'reverseUserIds':
        case 'starred':
        case 'statusValid':
        case 'tasksAllCompleted':
          if (value === true) {
            filters[snakedKey] = true;
          }
          break;

        // DateRangeInput
        case 'donationDate':
        case 'createdAt':
        case 'anniversary':
        case 'birthday':
        case 'gaveMoreThanPledgedRange':
        case 'lateAt':
        case 'nextAsk':
        case 'pledgeAmountIncreasedRange':
        case 'startedGivingRange':
        case 'stoppedGivingRange':
        case 'taskDueDate':
        case 'updatedAt':
          const dateRange = value as DateRangeInput;
          filters[snakedKey] = `${dateRange.min ?? ''}..${dateRange.max ?? ''}`;
          break;

        // Multiselect
        case 'almaMater':
        case 'appeal':
        case 'church':
        case 'city':
        case 'country':
        case 'designationAccountId':
        case 'donation':
        case 'donationAmount':
        case 'ids':
        case 'likely':
        case 'locale':
        case 'metroArea':
        case 'organizationId':
        case 'pledgeAmount':
        case 'pledgeCurrency':
        case 'pledgeFrequency':
        case 'primaryAddress':
        case 'referrer':
        case 'referrerIds':
        case 'region':
        case 'relatedTaskAction':
        case 'source':
        case 'state':
        case 'timezone':
        case 'userIds':
          filters[snakedKey] = (value as string[]).join(',');
          break;

        // Newsletter
        case 'newsletter':
          const newsletterMap = new Map<ContactFilterNewsletterEnum, string>([
            [ContactFilterNewsletterEnum.All, 'all'],
            [ContactFilterNewsletterEnum.Both, 'both'],
            [ContactFilterNewsletterEnum.Email, 'email'],
            [ContactFilterNewsletterEnum.EmailOnly, 'email_only'],
            [ContactFilterNewsletterEnum.None, 'none'],
            [ContactFilterNewsletterEnum.NoValue, 'no_value'],
            [ContactFilterNewsletterEnum.Physical, 'address'],
            [ContactFilterNewsletterEnum.PhysicalOnly, 'address_only'],
          ]);
          filters[snakedKey] =
            newsletterMap.get(value as ContactFilterNewsletterEnum) ?? '';
          break;

        // Status
        case 'status':
          filters[snakedKey] = (value as ContactFilterStatusEnum[])
            .map((status) => status.toLowerCase())
            .join(',');
          break;

        // String[]
        case 'contactType':
        case 'tags':
        case 'excludeTags':
          filters[snakedKey] = (value as string[]).join(',');
          break;

        // String and NumericRangeInput
        case 'addressLatLng':
        case 'appealStatus':
        case 'contactInfoAddr':
        case 'contactInfoEmail':
        case 'contactInfoFacebook':
        case 'contactInfoMobile':
        case 'contactInfoPhone':
        case 'contactInfoWorkPhone':
        case 'donationAmountRange':
        case 'donationPeriodAverage':
        case 'donationPeriodCount':
        case 'donationPeriodPercentRank':
        case 'donationPeriodSum':
        case 'nameLike':
        case 'notes':
        case 'optOut':
        case 'pledge':
        case 'pledgeLateBy':
        case 'wildcardSearch':
          filters[snakedKey] = value as
            | string
            | NumericRangeInput
            | ContactFilterNotesInput;
          break;

        default:
          throw new Error(`Unrecognized filter key ${key}`);
      }
    });
    // Switch wildcardNoteSearch to wildcard_note_search for API
    if ((filters.notes as ContactFilterNotesInput)?.wildcardNoteSearch) {
      filters.notes = {
        wildcard_note_search:
          (filters.notes as ContactFilterNotesInput).wildcardNoteSearch ?? '',
      };
    }

    const analysisPromise = this.post('reports/partner_giving_analysis', {
      body: {
        data: {
          type: 'partner_giving_analysis',
        },
        fields: {
          contacts:
            'donation_period_average,donation_period_count,donation_period_sum,last_donation_amount,last_donation_currency,last_donation_date,name,pledge_currency,total_donations',
        },
        filter: filters,
        page,
        per_page: pageSize,
        sort: `${sortAscending ? '' : '-'}${camelToSnake(sortField)}`,
      },
      headers: {
        'X-HTTP-Method-Override': 'GET',
      },
    });
    const countContactsPromise = this.get('contacts', {
      params: {
        'filter[account_list_id]': accountListId,
        per_page: '0',
      },
    });
    const [analysisResponse, countContactsResponse] = await Promise.all([
      analysisPromise,
      countContactsPromise,
    ]);
    return mapPartnerGivingAnalysisResponse(
      analysisResponse,
      countContactsResponse,
    );
  }

  async getAccountListDonorAccounts(accountListId: string, searchTerm: string) {
    const { data } = await this.get(
      `account_lists/${accountListId}/donor_accounts?fields[donor_accounts]=display_name,account_number&filter[wildcard_search]=${searchTerm}&per_page=6`,
    );

    return getAccountListDonorAccounts(data);
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
        body: {
          data: {
            attributes: {
              active,
              overwrite: true,
            },
            id: designationAccountId,
            type: 'designation_accounts',
          },
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
        body: {
          data: {
            attributes: {
              active,
              overwrite: true,
            },
            id: financialAccountId,
            type: 'financial_accounts',
          },
        },
      },
    );
    return setActiveFinancialAccount(data);
  }

  //
  // Financial Account Report -- Start

  async financialAccountSummary(
    accountListId: string,
    financialAccountId: string,
  ) {
    const include =
      'credit_by_categories,debit_by_categories,credit_by_categories.category,debit_by_categories.category';
    const filters = `filter[account_list_id]=${accountListId}&filter[financial_account_id]=${financialAccountId}`;
    const fields =
      'fields[financial_account_entry_by_categories]=amount,category&fields[financial_account_entry_categories]=name,code' +
      '&fields[reports_entry_histories_periods]=closing_balance,opening_balance,start_date,end_date,credits,debits,difference,credit_by_categories,debit_by_categories';

    const data = await this.get(
      `reports/entry_histories?${fields}&${filters}&include=${include}`,
    );

    return financialAccountSummaryHandler(data);
  }

  async financialAccountEntries(
    accountListId: string,
    financialAccountId: string,
    dateRange: string,
    categoryId?: string | null,
    wildcardSearch?: string | null,
  ) {
    const fields =
      'fields[financial_account_entry_categories]=name,code&fields[financial_account_entry_credits]=amount,code,currency,description,entry_date,category,type' +
      '&fields[financial_account_entry_debits]=amount,code,currency,description,entry_date,category,type';

    let filters = `filter[entryDate]=${dateRange}&filter[financialAccountId]=${financialAccountId}`;
    if (categoryId) {
      filters += `&filter[categoryId]=${categoryId}`;
    }
    if (wildcardSearch) {
      filters += `&filter[wildcardSearch]=${wildcardSearch}`;
    }
    const data = await this.get(
      `account_lists/${accountListId}/entries?${fields}&${filters}&include=category&per_page=10000&sort=-entry_date`,
    );

    return financialAccountEntriesHandler(data);
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

  //
  // Financial Account Report -- End

  async deleteComment(taskId: string, commentId: string) {
    const { data }: { data: DeleteCommentResponse } = await this.delete(
      `tasks/${taskId}/comments/${commentId}`,
    );
    return DeleteComment({ ...data, id: commentId });
  }

  async updateComment(taskId: string, commentId: string, body: string) {
    const { data }: { data: UpdateCommentResponse } = await this.put(
      `tasks/${taskId}/comments/${commentId}`,
      {
        body: {
          data: {
            type: 'comments',
            attributes: {
              body,
            },
          },
        },
      },
    );
    return UpdateComment(data);
  }

  async getDesginationDisplayNames(
    accountListId: string,
    startDate: string | undefined | null,
    endDate: string | undefined | null,
  ) {
    //'2022-11-01..2022-11-30'
    const {
      data,
      included,
    }: { data: DonationReponseData[]; included: DonationReponseIncluded[] } =
      await this.get(
        `account_lists/${accountListId}/donations?fields[designation_account]=display_name&filter[donation_date]=${startDate?.slice(
          0,
          10,
        )}...${endDate?.slice(
          0,
          10,
        )}&include=designation_account&per_page=10000`,
      );
    return getDesignationDisplayNames(data, included);
  }

  async destroyDonorAccount(contactId: string, donorAccountId: string) {
    const { data }: { data: DestroyDonorAccountResponse } = await this.put(
      `contacts/${contactId}`,
      {
        body: {
          included: [
            {
              type: 'donor_accounts',
              id: donorAccountId,
              attributes: {
                _destroy: '1',
              },
            },
          ],
          data: {
            type: 'contacts',
            id: contactId,
            relationships: {
              donor_accounts: {
                data: [
                  {
                    id: donorAccountId,
                    type: 'donor_accounts',
                  },
                ],
              },
            },
          },
        },
      },
    );
    return DestroyDonorAccount(data);
  }

  async deleteTags(tagName: string, page: string) {
    const { data } = await this.delete(`${page}/tags/bulk`, {
      params: { '0[name]': tagName },
      body: {
        data: [
          {
            data: {
              type: 'tags',
              attributes: {
                name: tagName,
              },
            },
          },
        ],
      },
    });
    return data;
  }

  // Google Integration
  //
  //

  async googleAccounts() {
    const response: GoogleAccountsResponse[] = await this.get(
      'user/google_accounts',
      {
        params: {
          sort: 'created_at',
          include: 'contact_groups',
        },
      },
    );
    return GoogleAccounts(response);
  }

  async googleAccountIntegrations(
    googleAccountId: string,
    accountListId: string,
  ) {
    const { data }: { data: GoogleIntegrationResponse[] } = await this.get(
      `user/google_accounts/${googleAccountId}/google_integrations?${encodeURI(
        `filter[account_list_id]=${accountListId}`,
      )}`,
    );
    return GoogleAccountIntegrations(data);
  }

  async syncGoogleIntegration(
    googleAccountId,
    googleIntegrationId,
    integrationName,
  ) {
    const { data }: { data: string } = await this.get(
      `user/google_accounts/${googleAccountId}/google_integrations/${googleIntegrationId}/sync?integration=${integrationName}`,
    );
    return SyncGoogleIntegration(data);
  }

  async createGoogleIntegration(
    googleAccountId,
    googleIntegration,
    accountListId,
  ) {
    const attributes = {};
    Object.keys(googleIntegration).forEach((key) => {
      attributes[camelToSnake(key)] = googleIntegration[key];
    });
    const { data }: { data: GoogleIntegrationResponse } = await this.post(
      `user/google_accounts/${googleAccountId}/google_integrations`,
      {
        body: {
          data: {
            attributes,
            relationships: {
              account_list: {
                data: {
                  type: 'account_lists',
                  id: accountListId,
                },
              },
            },
            type: 'google_integrations',
          },
        },
      },
    );
    return CreateGoogleIntegration(data);
  }

  async updateGoogleIntegration(
    googleAccountId,
    googleIntegrationId,
    googleIntegration,
  ) {
    interface GoogleIntegrationAttributes {
      overwrite?: boolean;
      calendar_id?: string;
      calendar_integrations?: string[];
    }
    const attributes: GoogleIntegrationAttributes = {};
    Object.keys(googleIntegration).map((key) => {
      attributes[camelToSnake(key)] = googleIntegration[key];
    });
    if (attributes?.calendar_integrations) {
      // Convert to lowercase since we convert them from lowercase to Uppercase
      // when we fetch initially from  pages/api/Schema/Settings/Integrations/Google/parse.ts
      attributes.calendar_integrations = attributes?.calendar_integrations.map(
        (integration) => integration.toLowerCase(),
      );
    }

    const { data }: { data: GoogleIntegrationResponse } = await this.put(
      `user/google_accounts/${googleAccountId}/google_integrations/${googleIntegrationId}`,
      {
        body: {
          data: {
            attributes,
            id: googleIntegrationId,
            type: 'google_integrations',
          },
        },
      },
    );
    return UpdateGoogleIntegration(data);
  }

  async deleteGoogleAccount(accountId) {
    await this.delete(`user/google_accounts/${accountId}`, {
      body: {
        data: {
          type: 'google_accounts',
        },
      },
    });
    return DeleteDataHandler();
  }

  // Mailchimp Integration
  //
  //
  async mailchimpAccount(accountListId) {
    // Catch since it will return an error if no account found
    try {
      const { data }: { data: MailchimpAccountResponse } = await this.get(
        `account_lists/${accountListId}/mail_chimp_account`,
      );
      return MailchimpAccount(data);
    } catch {
      return MailchimpAccount(null);
    }
  }

  async updateMailchimpAccount(
    accountListId,
    mailchimpAccountId,
    mailchimpAccount,
  ) {
    const attributes = {};
    Object.keys(mailchimpAccount).map((key) => {
      attributes[camelToSnake(key)] = mailchimpAccount[key];
    });

    const { data }: { data: UpdateMailchimpAccountResponse } = await this.put(
      `account_lists/${accountListId}/mail_chimp_account`,
      {
        body: {
          data: {
            attributes: {
              overwrite: true,
              ...attributes,
            },
            id: mailchimpAccountId,
            type: 'mail_chimp_accounts',
          },
        },
      },
    );
    return UpdateMailchimpAccount(data);
  }

  async syncMailchimpAccount(accountListId) {
    await this.get(`account_lists/${accountListId}/mail_chimp_account/sync`);
    return SyncMailchimpAccount();
  }

  async deleteMailchimpAccount(accountListId) {
    await this.delete(`account_lists/${accountListId}/mail_chimp_account`);
    return DeleteDataHandler();
  }

  // Prayerletters Integration
  //
  //
  async prayerlettersAccount(accountListId) {
    // Catch since it will return an error if no account found
    try {
      const { data }: { data: PrayerlettersAccountResponse } = await this.get(
        `account_lists/${accountListId}/prayer_letters_account`,
      );
      return PrayerlettersAccount(data);
    } catch {
      return PrayerlettersAccount(null);
    }
  }

  async syncPrayerlettersAccount(accountListId) {
    await this.get(
      `account_lists/${accountListId}/prayer_letters_account/sync`,
    );
    return SyncPrayerlettersAccount();
  }

  async deletePrayerlettersAccount(accountListId) {
    await this.delete(`account_lists/${accountListId}/prayer_letters_account`);
    return DeleteDataHandler();
  }

  // Chalkline Integration
  //
  //

  async sendToChalkline(accountListId) {
    await this.post(`account_lists/${accountListId}/chalkline_mail`, {
      body: {
        data: {
          type: 'chalkline_mails',
        },
      },
    });
    return SendToChalkline();
  }
  // Personal Preferences
  //
  //
  //To determine whether or not to show the export all data accordion on the Preferences page
  async canUserExportData(accountListId: string) {
    const data = await this.get(
      `account_lists/${accountListId}/exports/allowed`,
    );

    return canUserExportData(data);
  }

  //Send a request to begin exporting data
  async exportData(accountListId: string) {
    await this.get(`account_lists/${accountListId}/exports`);
    return 'Success';
  }

  // =========================================
  // ORGANIZATION
  // =========================================

  // Manage Organization
  //
  //

  async organizations() {
    const data: OrganizationsResponse = await this.get(
      `organizations?fields[organization]=name&per_page=2500`,
    );
    return Organizations(data);
  }

  async organizationAdmins(organizationId: string) {
    const data: OrganizationAdminsResponse = await this.get(
      `organizations/${organizationId}/admins`,
    );
    return OrganizationAdmins(data);
  }

  async organizationInvites(organizationId: string) {
    const data: OrganizationInvitesResponse = await this.get(
      `organizations/${organizationId}/invites`,
    );
    return OrganizationInvites(data);
  }

  async destroyOrganizationInvite(organizationId: string, inviteId: string) {
    await this.delete(`organizations/${organizationId}/invites/${inviteId}`, {
      body: {
        data: {
          type: 'organization_invites',
        },
      },
    });
    return DeleteDataHandler();
  }

  async destroyOrganizationAdmin(organizationId: string, adminId: string) {
    await this.delete(`organizations/${organizationId}/admins/${adminId}`, {
      body: {
        data: {
          type: 'admins',
        },
      },
    });
    return DeleteDataHandler();
  }

  async createOrganizationInvite(
    organizationId: string,
    recipientEmail: string,
  ) {
    const { data }: { data: OrganizationInvite } = await this.post(
      `organizations/${organizationId}/invites`,
      {
        body: {
          data: {
            attributes: {
              invite_user_as: 'admin',
              recipient_email: recipientEmail,
            },
            type: 'organization_invites',
          },
        },
      },
    );
    return CreateOrganizationInvite(data);
  }

  // Organization Contacts
  //
  //

  async searchOrganizationsContacts(
    organizationId: string,
    search: string,
    pageNumber = 1,
  ) {
    const include =
      'people,people.email_addresses,people.phone_numbers,addresses,account_list,' +
      'account_list.account_list_users,account_list.account_list_users.user_email_addresses';
    const filters =
      `filter[organization_id]=${organizationId}` +
      `&filter[wildcard_search]=${search}` +
      '&filter[status]=active,hidden,null';
    const fields =
      'fields[contact]=name,people,account_list,addresses,allow_deletion,square_avatar' +
      '&fields[people]=first_name,last_name,email_addresses,phone_numbers,deceased' +
      '&fields[email_addresses]=email,primary,historic' +
      '&fields[phone_numbers]=number,primary,historic' +
      '&fields[account_lists]=name,account_list_users' +
      '&fields[account_list_users]=user_first_name,user_last_name,user_email_addresses' +
      '&fields[addresses]=primary_mailing_address,street,city,state,postal_code';

    const data: SearchOrganizationsContactsResponse = await this.get(
      `organizations/contacts?data[type]=contacts&${fields}&${filters}&include=${include}&page=${pageNumber}`,
    );
    return SearchOrganizationsContacts(data);
  }

  async deleteOrganizationContact(contactId) {
    await this.delete(`organizations/contacts/${contactId}`, {
      body: {
        data: {
          type: 'contacts',
        },
      },
    });
    return DeleteDataHandler();
  }

  // Organization AccountLists
  //
  //

  async searchOrganizationsAccountLists(
    search: string,
    pageNumber = 1,
    organizationId?: string,
  ) {
    const include =
      'account_list_users,account_list_coaches,account_list_users.user_email_addresses,' +
      'account_list_coaches.coach_email_addresses,designation_accounts,' +
      'designation_accounts.organization,account_list_invites,' +
      'account_list_invites.invited_by_user';
    const organizationIdFilter = organizationId
      ? `&filter[organization_id]=${organizationId}`
      : '';
    const filters = `filter[wildcard_search]=${search}` + organizationIdFilter;
    const fields =
      'fields[account_lists]=name,account_list_coaches,account_list_users,account_list_invites,designation_accounts,organization_count' +
      '&fields[account_list_coaches]=coach_first_name,coach_last_name,coach_email_addresses' +
      '&fields[account_list_users]=user_first_name,user_last_name,user_email_addresses,allow_deletion,user_id,last_synced_at,organization_count' +
      '&fields[email_addresses]=email,primary' +
      '&fields[designation_accounts]=display_name,organization' +
      '&fields[organizations]=name' +
      '&fields[account_list_invites]=recipient_email,invite_user_as,invited_by_user' +
      '&fields[users]=first_name,last_name';

    const data: SearchOrganizationsAccountListsResponse = await this.get(
      `organizations/account_lists?data[type]=account_lists&${fields}&${filters}&include=${include}&page=${pageNumber}`,
    );

    return SearchOrganizationsAccountLists(data);
  }

  async adminDeleteOrganizationUser(accountListId: string, userId: string) {
    await this.delete(
      `organizations/account_lists/${accountListId}/account_list_users/${userId}`,
      {
        body: {
          data: {
            type: 'account_list_users',
          },
        },
      },
    );
    return DeleteDataHandler();
  }

  async adminDeleteOrganizationCoach(accountListId: string, coachId: string) {
    await this.delete(
      `organizations/account_lists/${accountListId}/account_list_coaches/${coachId}`,
      {
        body: {
          data: {
            type: 'account_list_coaches',
          },
        },
      },
    );
    return DeleteDataHandler();
  }

  async adminDeleteOrganizationInvite(accountListId: string, inviteId: string) {
    await this.delete(
      `organizations/account_lists/${accountListId}/invites/${inviteId}`,
      {
        body: {
          data: {
            type: 'account_list_invites',
          },
        },
      },
    );
    return DeleteDataHandler();
  }
}

export interface Context {
  dataSources: { mpdxRestApi: MpdxRestApi };
}

const cors = Cors({
  origin: 'https://studio.apollographql.com',
  allowCredentials: true,
});

const apolloServer = new ApolloServer({
  schema,
  allowBatchedHttpRequests: true,
});

const handler = startServerAndCreateNextHandler(apolloServer, {
  context: async (req: NextApiRequest): Promise<Context> => ({
    dataSources: {
      mpdxRestApi: new MpdxRestApi(req.headers.authorization ?? ''),
    },
  }),
});

export default cors(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.end();
    return false;
  }
  await handler(req, res);
});
