import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityTypeEnum } from 'src/graphql/types.generated';
import { ActivityTypeAutocomplete } from './ActivityTypeAutocomplete';

describe('ActivityTypeAutocomplete', () => {
  const options = [
    ActivityTypeEnum.InitiationPhoneCall,
    ActivityTypeEnum.InitiationTextMessage,
    ActivityTypeEnum.None,
  ];

  it('puts the none option first', () => {
    const onChange = jest.fn();

    const { getByRole, getAllByRole } = render(
      <ActivityTypeAutocomplete
        options={options}
        label="Type"
        value={ActivityTypeEnum.InitiationPhoneCall}
        onChange={onChange}
      />,
    );

    userEvent.click(getByRole('combobox', { name: 'Type' }));
    expect(getAllByRole('option')[0]).toHaveTextContent('None');
  });

  it('converts none values to null', () => {
    const onChange = jest.fn();

    const { getByRole } = render(
      <ActivityTypeAutocomplete
        options={options}
        label="Type"
        value={ActivityTypeEnum.InitiationPhoneCall}
        onChange={onChange}
      />,
    );

    const input = getByRole('combobox', { name: 'Type' });
    userEvent.click(input);
    userEvent.click(getByRole('option', { name: 'None' }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('preserves none values', () => {
    const onChange = jest.fn();

    const { getByRole } = render(
      <ActivityTypeAutocomplete
        options={options}
        label="Type"
        value={ActivityTypeEnum.InitiationPhoneCall}
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
