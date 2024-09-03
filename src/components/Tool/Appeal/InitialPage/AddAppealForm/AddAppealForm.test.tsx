import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import AddAppealForm, {
  AddAppealFormProps,
  buildExclusionFilter,
  buildInclusionFilter,
  calculateGoal,
  contactExclusions,
} from './AddAppealForm';
import {
  ContactFiltersQuery,
  ContactTagsQuery,
} from './AddAppealForm.generated';
import { contactFiltersMock, contactTagsMock } from './AddAppealFormMocks';

const accountListId = 'accountListId';
const router = {
  query: { accountListId },
  isReady: true,
};
const mutationSpy = jest.fn();

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const Components = ({
  appealName,
  appealGoal,
  appealStatuses,
  appealExcludes,
  appealIncludes,
  formRef,
}: Omit<AddAppealFormProps, 'accountListId'>) => (
  <I18nextProvider i18n={i18n}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider<{
              ContactTags: ContactTagsQuery;
              ContactFilters: ContactFiltersQuery;
            }>
              mocks={{
                ContactTags: contactTagsMock,
                ContactFilters: contactFiltersMock,
              }}
              onCall={mutationSpy}
            >
              <AppealsWrapper>
                <AddAppealForm
                  accountListId={accountListId}
                  appealName={appealName}
                  appealGoal={appealGoal}
                  appealStatuses={appealStatuses}
                  appealExcludes={appealExcludes}
                  appealIncludes={appealIncludes}
                  formRef={formRef}
                />
              </AppealsWrapper>
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>
    </LocalizationProvider>
  </I18nextProvider>
);

describe('AddAppealForm', () => {
  beforeEach(() => {
    mutationSpy.mockClear();
    mockEnqueue.mockClear();
  });

  it('default', async () => {
    const { getByRole, getByTestId } = render(<Components />);

    expect(getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
    expect(
      getByRole('spinbutton', { name: 'Initial Goal' }),
    ).toBeInTheDocument();
    expect(
      getByRole('spinbutton', { name: 'Letter Cost' }),
    ).toBeInTheDocument();
    expect(getByRole('spinbutton', { name: 'Goal' })).toBeInTheDocument();
    expect(getByRole('spinbutton', { name: 'Admin %' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Add Appeal' })).toBeInTheDocument();
    expect(getByTestId('contactStatusSelect-selectAll')).toBeInTheDocument();
    await waitFor(() =>
      expect(getByTestId('contactStatusSelect')).toBeInTheDocument(),
    );
    expect(getByTestId('contactTagsSelect-selectAll')).toBeInTheDocument();
    expect(getByTestId('contactTagsSelect')).toBeInTheDocument();
    expect(getByTestId('exclusionsSelect')).toBeInTheDocument();
  });

  describe('Goal calculations', () => {
    it('should show errors', async () => {
      const { getByRole, getByText, findByText, queryByText } = render(
        <Components />,
      );

      const name = getByRole('textbox', { name: 'Name' });
      const initialGoal = getByRole('spinbutton', { name: 'Initial Goal' });
      const letterCost = getByRole('spinbutton', { name: 'Letter Cost' });
      const adminPercent = getByRole('spinbutton', { name: 'Admin %' });
      const goalAmount = getByRole('spinbutton', { name: 'Goal' });

      userEvent.clear(name);
      userEvent.tab();

      expect(await findByText(/please enter a name/i)).toBeInTheDocument();

      userEvent.clear(initialGoal);
      userEvent.clear(letterCost);
      userEvent.clear(adminPercent);

      expect(goalAmount).toHaveValue(0);

      expect(await findByText(/initial goal is required/i)).toBeInTheDocument();

      expect(getByText(/letter cost is required/i)).toBeInTheDocument();
      expect(getByText(/admin cost is required/i)).toBeInTheDocument();

      userEvent.clear(initialGoal);
      userEvent.type(initialGoal, '-5');
      userEvent.clear(letterCost);
      userEvent.type(letterCost, '-5');
      userEvent.clear(adminPercent);
      userEvent.type(adminPercent, '-5');
      expect(
        await findByText(/must use a positive number for initial goal/i),
      ).toBeInTheDocument();
      expect(
        getByText(/must use a positive number for letter cost/i),
      ).toBeInTheDocument();
      expect(
        getByText(/must use a positive number for admin cost/i),
      ).toBeInTheDocument();

      userEvent.clear(initialGoal);
      userEvent.type(initialGoal, '2000');
      userEvent.clear(letterCost);
      userEvent.type(letterCost, '0');
      userEvent.clear(adminPercent);
      userEvent.type(adminPercent, '50');
      await waitFor(() => {
        expect(
          queryByText(/initial goal is required/i),
        ).not.toBeInTheDocument();
        expect(
          queryByText(/must use a positive number for initial goal/i),
        ).not.toBeInTheDocument();
        expect(queryByText(/letter cost is required/i)).not.toBeInTheDocument();
        expect(
          queryByText(/must use a positive number for letter cost/i),
        ).not.toBeInTheDocument();
        expect(queryByText(/admin cost is required/i)).not.toBeInTheDocument();
        expect(
          queryByText(/must use a positive number for admin cost/i),
        ).not.toBeInTheDocument();
      });
    });

    it('should calculate the Goal amount correctly', async () => {
      const { getByRole } = render(<Components />);

      const initialGoal = getByRole('spinbutton', { name: 'Initial Goal' });
      const letterCost = getByRole('spinbutton', { name: 'Letter Cost' });
      const adminPercent = getByRole('spinbutton', { name: 'Admin %' });
      const goalAmount = getByRole('spinbutton', { name: 'Goal' });

      userEvent.clear(initialGoal);
      userEvent.type(initialGoal, '2500');

      userEvent.clear(letterCost);
      userEvent.type(letterCost, '500');

      userEvent.clear(adminPercent);
      userEvent.type(adminPercent, '10');

      expect(goalAmount).toHaveValue(3333.33);
    });
  });

  describe('Select all buttons', () => {
    it('selects all statues', async () => {
      const { getByText, findByText, queryByText, getByTestId } = render(
        <Components />,
      );

      await waitFor(() =>
        expect(getByTestId('contactStatusSelect')).toBeInTheDocument(),
      );

      const selectAllStatusesButton = getByTestId(
        'contactStatusSelect-selectAll',
      );

      expect(queryByText('New Connection')).not.toBeInTheDocument();
      expect(queryByText('Ask in Future')).not.toBeInTheDocument();

      userEvent.click(selectAllStatusesButton);

      expect(await findByText('New Connection')).toBeInTheDocument();
      expect(getByText('Ask in Future')).toBeInTheDocument();
      // Ensures the '--- All Active ---' option isn't added
      expect(queryByText('--- All Active ---')).not.toBeInTheDocument();
    });

    it('selects all tags', async () => {
      const { findByTestId, getByText, queryByText } = render(<Components />);

      const selectAllTagsButton = await findByTestId(
        'contactTagsSelect-selectAll',
      );

      expect(queryByText('tag-1')).not.toBeInTheDocument();
      expect(queryByText('tag-2')).not.toBeInTheDocument();
      expect(queryByText('tag-3')).not.toBeInTheDocument();
      expect(queryByText('tag-4')).not.toBeInTheDocument();

      userEvent.click(selectAllTagsButton);

      expect(getByText('tag-1')).toBeInTheDocument();
      expect(getByText('tag-2')).toBeInTheDocument();
      expect(getByText('tag-3')).toBeInTheDocument();
      expect(getByText('tag-4')).toBeInTheDocument();
    });
  });

  describe('Select values', () => {
    it('selects contact statuses options', async () => {
      const { findByTestId, findByText, getByRole } = render(<Components />);

      const contactStatusSelect = await findByTestId('contactStatusSelect');
      userEvent.type(contactStatusSelect, 'New Connection');
      userEvent.selectOptions(getByRole('listbox'), 'New Connection');

      expect(await findByText('New Connection')).toBeInTheDocument();
    });

    it('selects tags options', async () => {
      const { findByTestId, queryByText, findByText, getByRole } = render(
        <Components />,
      );

      const contactTagsSelect = await findByTestId('contactTagsSelect');
      userEvent.type(contactTagsSelect, 'tag-3');
      userEvent.selectOptions(getByRole('listbox'), 'tag-3');

      expect(await findByText('tag-3')).toBeInTheDocument();
      expect(queryByText('tag-2')).not.toBeInTheDocument();
    });

    it('selects Exclude contacts options', async () => {
      const { findByTestId, getByText, findByText, getByRole } = render(
        <Components />,
      );

      const exclusionsSelect = await findByTestId('exclusionsSelect');

      userEvent.type(exclusionsSelect, 'May have given');
      userEvent.selectOptions(
        getByRole('listbox'),
        'May have given a special gift in the last 3 months',
      );

      userEvent.type(exclusionsSelect, 'May have increased');
      userEvent.selectOptions(
        getByRole('listbox'),
        'May have increased their giving in the last 3 months',
      );

      expect(
        await findByText('May have given a special gift in the last 3 months'),
      ).toBeInTheDocument();
      expect(
        getByText('May have increased their giving in the last 3 months'),
      ).toBeInTheDocument();
    });
  });

  describe('Functions', () => {
    it('calculateGoal()', async () => {
      expect(calculateGoal(1000, 0, 10)).toBe(1111.11);

      expect(calculateGoal(1000, 2000, 10)).toBe(3333.33);

      expect(calculateGoal(1000, 2000, 60)).toBe(7500);

      expect(calculateGoal(30000, 1568, 12)).toBe(35872.73);
    });

    describe('buildInclusionFilter', () => {
      const tags = ['tag-1', 'tag-2'];
      const statuses = [
        {
          name: 'New Connection',
          value: 'NEVER_CONTACTED',
        },
        {
          name: 'Ask in Future',
          value: 'ASK_IN_FUTURE',
        },
      ];

      it('should return an empty object', async () => {
        expect(
          buildInclusionFilter({
            statuses: [],
            tags: [],
            appealIncludes: {},
          }),
        ).toStrictEqual({});
      });

      it('should remove properties with null values', async () => {
        expect(
          buildInclusionFilter({
            statuses: [],
            tags: [],
            appealIncludes: {
              someFilter: null,
              anotherFilter: 'anotherValue',
            },
          }),
        ).toStrictEqual({
          any_tags: true,
          anotherFilter: 'anotherValue',
        });
      });

      it('should return appealIncludes with any_tags', async () => {
        expect(
          buildInclusionFilter({
            statuses: [],
            tags: [],
            appealIncludes: {
              someFilter: 'someValue',
              anotherFilter: 'anotherValue',
            },
          }),
        ).toStrictEqual({
          any_tags: true,
          someFilter: 'someValue',
          anotherFilter: 'anotherValue',
        });
      });

      it('returns filter with tags, status', async () => {
        expect(
          buildInclusionFilter({
            statuses,
            tags,
            appealIncludes: {},
          }),
        ).toStrictEqual({
          any_tags: true,
          tags: 'tag-1,tag-2',
          status: 'NEVER_CONTACTED,ASK_IN_FUTURE',
        });
      });
    });

    describe('buildExclusionFilter', () => {
      contactExclusions;

      it('should return an empty object', async () => {
        expect(buildExclusionFilter([])).toStrictEqual({});
      });

      it('should only return three properties with dates', async () => {
        expect(
          buildExclusionFilter([
            contactExclusions[0],
            contactExclusions[1],
            contactExclusions[2],
          ]),
        ).toStrictEqual({
          started_giving_range: '2019-10-01..2020-01-01',
          gave_more_than_pledged_range: '2019-10-01..2020-01-01',
          pledge_amount_increased_range: '2019-10-01..2020-01-01',
        });
      });

      it('should only return the last 2 properties', async () => {
        expect(
          buildExclusionFilter([contactExclusions[3], contactExclusions[4]]),
        ).toStrictEqual({
          pledge_late_by: '30_90',
          no_appeals: true,
        });
      });
    });
  });

  describe('On Submit', () => {
    it('should call the mutation', async () => {
      const { getByRole, findByTestId } = render(<Components />);

      const name = getByRole('textbox', { name: 'Name' });
      const initialGoal = getByRole('spinbutton', { name: 'Initial Goal' });
      const letterCost = getByRole('spinbutton', { name: 'Letter Cost' });
      const adminPercent = getByRole('spinbutton', { name: 'Admin %' });

      // Name
      userEvent.type(name, 'Test Appeal');

      // Goal
      userEvent.clear(initialGoal);
      userEvent.type(initialGoal, '1000');
      userEvent.clear(letterCost);
      userEvent.type(letterCost, '0');
      userEvent.clear(adminPercent);
      userEvent.type(adminPercent, '10');

      // Contact to include
      const contactStatusSelect = await findByTestId('contactStatusSelect');
      userEvent.type(contactStatusSelect, 'New Connection');
      userEvent.selectOptions(getByRole('listbox'), 'New Connection');

      // Contact with tags to include
      const selectAllTagsButton = await findByTestId(
        'contactTagsSelect-selectAll',
      );
      userEvent.click(selectAllTagsButton);

      // Contact to avoid
      const exclusionsSelect = await findByTestId('exclusionsSelect');
      userEvent.type(exclusionsSelect, 'May have given');
      userEvent.selectOptions(
        getByRole('listbox'),
        'May have given a special gift in the last 3 months',
      );
      const submitButton = getByRole('button', { name: 'Add Appeal' });
      expect(submitButton).toBeEnabled();
      userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith('Appeal successfully added!', {
          variant: 'success',
        });
      });

      expect(mutationSpy.mock.lastCall[0].operation.operationName).toEqual(
        'CreateAppeal',
      );

      expect(mutationSpy.mock.lastCall[0].operation.variables).toMatchObject({
        accountListId,
        attributes: {
          name: 'Test Appeal',
          amount: 1111.11,
          inclusionFilter: {
            any_tags: true,
            tags: 'tag-1,tag-2,tag-3,tag-4',
            status: 'NEVER_CONTACTED',
          },
          exclusionFilter: {
            gave_more_than_pledged_range: '2019-10-01..2020-01-01',
          },
        },
      });
    });
  });
});
