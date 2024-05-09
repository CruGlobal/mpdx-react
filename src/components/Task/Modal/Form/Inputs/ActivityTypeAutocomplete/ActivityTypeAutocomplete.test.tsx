import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ActivityTypeEnum, PhaseEnum } from 'src/graphql/types.generated';
import { phasesMock } from '../../TaskModalHelper';
import { ActivityTypeAutocomplete } from './ActivityTypeAutocomplete';

describe('ActivityTypeAutocomplete', () => {
  const options = [
    ActivityTypeEnum.AppointmentPhoneCall,
    ActivityTypeEnum.FollowUpTextMessage,
    ActivityTypeEnum.None,
  ];
  const phase = PhaseEnum.Appointment;

  it('puts the none option first', () => {
    const onChange = jest.fn();

    const { getByRole, getAllByRole } = render(
      <ActivityTypeAutocomplete
        options={options}
        taskPhaseType={phase}
        label="Type"
        value={ActivityTypeEnum.AppointmentPhoneCall}
        onChange={onChange}
      />,
    );

    userEvent.click(getByRole('combobox', { name: 'Type' }));
    expect(getAllByRole('option')[0]).toHaveTextContent('None');
  });

  it('converts none values to null', async () => {
    const onChange = jest.fn();

    const { getByRole } = render(
      <GqlMockedProvider mocks={phasesMock}>
        <ActivityTypeAutocomplete
          options={options}
          taskPhaseType={phase}
          label="Type"
          value={ActivityTypeEnum.AppointmentPhoneCall}
          onChange={onChange}
        />
      </GqlMockedProvider>,
    );

    const input = getByRole('combobox', { name: 'Type' });
    userEvent.click(input);
    await waitFor(() => userEvent.click(getByRole('option', { name: 'None' })));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('preserves none values', () => {
    const onChange = jest.fn();

    const { getByRole } = render(
      <ActivityTypeAutocomplete
        options={options}
        taskPhaseType={phase}
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
});
