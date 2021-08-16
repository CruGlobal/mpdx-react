import React from 'react';
import { render } from '@testing-library/react';
import { mdiAlert } from '@mdi/js';
import Tool from './Tool';

describe('Tool', () => {
  it('props', () => {
    const { getByTestId } = render(
      <Tool
        tool={'Test'}
        desc={'Test description!!!'}
        icon={mdiAlert}
        id={'test'}
      />,
    );
    expect(getByTestId('ToolNameTypography').textContent).toEqual('Test');
    expect(getByTestId('ToolDescriptionTypography').textContent).toEqual(
      'Test description!!!',
    );
  });
});
