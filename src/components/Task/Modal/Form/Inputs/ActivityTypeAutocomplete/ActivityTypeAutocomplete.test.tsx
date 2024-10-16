import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { LoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import {
  loadConstantsMockData as LoadConstants,
  loadConstantsMockData,
} from 'src/components/Constants/LoadConstantsMock';
import { ActivityTypeEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { getLocalizedPhase } from 'src/utils/functions/getLocalizedPhase';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';
import { ActivityTypeAutocomplete } from './ActivityTypeAutocomplete';

describe('ActivityTypeAutocomplete', () => {
  const options = [
    ActivityTypeEnum.AppointmentPhoneCall,
    ActivityTypeEnum.FollowUpTextMessage,
    ActivityTypeEnum.None,
  ];
  const allOptions = Object.values(ActivityTypeEnum);

  const activitiesMap = new Map();

  loadConstantsMockData?.constant.phases?.forEach((phase) => {
    phase?.tasks?.forEach((task) => {
      activitiesMap.set(task, {
        name: getLocalizedTaskType(i18n.t, task),
        phaseId: phase.id,
        phase: getLocalizedPhase(i18n.t, phase.id),
        title: loadConstantsMockData?.constant?.activities?.find(
          (activity) => activity.id === task,
        )?.value,
      });
    });
  });

  it('puts the none option first', () => {
    const onChange = jest.fn();

    const { getByRole, getAllByRole } = render(
      <ActivityTypeAutocomplete
        options={options}
        label="Type"
        value={ActivityTypeEnum.AppointmentPhoneCall}
        onChange={onChange}
      />,
    );

    userEvent.click(getByRole('combobox', { name: 'Type' }));
    expect(getAllByRole('option')[0]).toHaveTextContent('None');
  });

  it('converts none values to undefined', async () => {
    const onChange = jest.fn();

    const { getByRole } = render(
      <GqlMockedProvider<{
        LoadConstants: LoadConstantsQuery;
      }>
        mocks={{ LoadConstants }}
      >
        <ActivityTypeAutocomplete
          options={options}
          label="Type"
          value={ActivityTypeEnum.AppointmentPhoneCall}
          onChange={onChange}
        />
      </GqlMockedProvider>,
    );

    const input = getByRole('combobox', { name: 'Type' });
    userEvent.click(input);
    await waitFor(() => userEvent.click(getByRole('option', { name: 'None' })));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('preserves none values', () => {
    const onChange = jest.fn();

    const { getByRole } = render(
      <ActivityTypeAutocomplete
        options={options}
        label="Type"
        value={ActivityTypeEnum.AppointmentPhoneCall}
        onChange={onChange}
        preserveNone
      />,
    );

    const input = getByRole('combobox', { name: 'Type' });
    userEvent.click(input);
    userEvent.click(getByRole('option', { name: 'None' }));
    expect(onChange).toHaveBeenCalledWith(ActivityTypeEnum.None);
  });

  it('displays Phase in Next Action option when returning all activity types', async () => {
    const onChange = jest.fn();

    const { getByRole, findByText } = render(
      <ActivityTypeAutocomplete
        options={allOptions}
        label="Type"
        value={ActivityTypeEnum.AppointmentPhoneCall}
        onChange={onChange}
        activityTypes={activitiesMap}
      />,
    );

    const input = getByRole('combobox', { name: 'Type' });
    userEvent.click(input);
    expect(await findByText('Appointment - Phone Call')).toBeInTheDocument();
  });

  it('Autocomplete is disabled if there are no options', async () => {
    const onChange = jest.fn();

    const { getByRole } = render(
      <ActivityTypeAutocomplete
        options={[]}
        label="Type"
        value={undefined}
        onChange={onChange}
      />,
    );

    const input = getByRole('combobox', { name: 'Type' });
    expect(input).toBeDisabled();
  });
});
