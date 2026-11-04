import React from 'react';
import { render } from '@testing-library/react';
import { HcmPersonNotFoundAlert } from './HcmPersonNotFoundAlert';

describe('HcmPersonNotFoundAlert', () => {
  it('tells you salary is not split by person', () => {
    const { getByRole } = render(<HcmPersonNotFoundAlert />);

    expect(getByRole('status')).toHaveTextContent(
      "HR no longer has a record for you, so salary isn't split by person on this report.",
    );
  });

  it('names the person rather than you in supervisor view', () => {
    const { getByRole } = render(<HcmPersonNotFoundAlert isSupervisorView />);

    expect(getByRole('status')).toHaveTextContent(
      "HR no longer has a record for this person, so salary isn't split by person on this report.",
    );
  });
});
