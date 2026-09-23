import React from 'react';
import { RadioGroup } from '@mui/material';
import { render } from '@testing-library/react';
import { DescribedRadioOption } from './DescribedRadioOption';

describe('DescribedRadioOption', () => {
  it('names the radio by its label alone and links the description via aria-describedby', () => {
    const { getByRole, getByText } = render(
      <RadioGroup>
        <DescribedRadioOption
          value="A"
          label="Option A"
          description="The first choice"
        />
      </RadioGroup>,
    );

    const radio = getByRole('radio', { name: 'Option A' });
    expect(getByText('The first choice')).toHaveAttribute(
      'id',
      radio.getAttribute('aria-describedby'),
    );
  });

  it('omits aria-describedby when there is no description', () => {
    const { getByRole } = render(
      <RadioGroup>
        <DescribedRadioOption value="B" label="Option B" />
      </RadioGroup>,
    );

    expect(getByRole('radio', { name: 'Option B' })).not.toHaveAttribute(
      'aria-describedby',
    );
  });
});
