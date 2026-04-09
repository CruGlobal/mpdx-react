import { render } from '@testing-library/react';
import { EligibilityStatusTable } from './EligibilityStatusTable';

describe('EligibilityStatusTable', () => {
  it('renders single eligible user without contact info', () => {
    const { getByRole, queryByTestId } = render(
      <EligibilityStatusTable userPreferredName="John" userEligible={true} />,
    );

    expect(getByRole('columnheader', { name: 'John' })).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Eligible' })).toBeInTheDocument();
    expect(
      getByRole('cell', { name: 'Completed the required IBS courses' }),
    ).toBeInTheDocument();
    expect(queryByTestId('eligibility-contact-info')).not.toBeInTheDocument();
  });

  it('renders single ineligible user with IBS reason and contact info', () => {
    const { getByRole, getByTestId } = render(
      <EligibilityStatusTable
        userPreferredName="John"
        userEligible={false}
        userCountry="US"
      />,
    );

    expect(getByRole('columnheader', { name: 'John' })).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Ineligible' })).toBeInTheDocument();
    expect(
      getByRole('cell', {
        name: 'Has not completed the required IBS courses',
      }),
    ).toBeInTheDocument();
    expect(getByTestId('eligibility-contact-info')).toBeInTheDocument();
  });

  it('renders single ineligible user with MHI reason when country is Italy', () => {
    const { getByRole } = render(
      <EligibilityStatusTable
        userPreferredName="Marco"
        userEligible={false}
        userCountry="IT"
      />,
    );

    expect(
      getByRole('cell', { name: 'Must complete an MHI form instead' }),
    ).toBeInTheDocument();
  });

  it('renders married couple both eligible without contact info', () => {
    const { getByRole, getAllByRole, queryByTestId } = render(
      <EligibilityStatusTable
        userPreferredName="John"
        userEligible={true}
        spousePreferredName="Jane"
        spouseEligible={true}
      />,
    );

    expect(getByRole('columnheader', { name: 'John' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Jane' })).toBeInTheDocument();
    expect(getAllByRole('cell', { name: 'Eligible' })).toHaveLength(2);
    expect(
      getAllByRole('cell', { name: 'Completed the required IBS courses' }),
    ).toHaveLength(2);
    expect(queryByTestId('eligibility-contact-info')).not.toBeInTheDocument();
  });

  it('renders married couple with mixed eligibility', () => {
    const { getByRole, getByTestId } = render(
      <EligibilityStatusTable
        userPreferredName="John"
        userEligible={true}
        spousePreferredName="Jane"
        spouseEligible={false}
        spouseCountry="US"
      />,
    );

    expect(getByRole('columnheader', { name: 'John' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Jane' })).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Ineligible' })).toBeInTheDocument();
    expect(
      getByRole('cell', {
        name: 'Has not completed the required IBS courses',
      }),
    ).toBeInTheDocument();
    expect(getByTestId('eligibility-contact-info')).toBeInTheDocument();
  });

  it('renders married couple both ineligible with mixed reasons', () => {
    const { getByRole } = render(
      <EligibilityStatusTable
        userPreferredName="Marco"
        userEligible={false}
        userCountry="IT"
        spousePreferredName="Jane"
        spouseEligible={false}
        spouseCountry="US"
      />,
    );

    expect(
      getByRole('cell', { name: 'Must complete an MHI form instead' }),
    ).toBeInTheDocument();
    expect(
      getByRole('cell', {
        name: 'Has not completed the required IBS courses',
      }),
    ).toBeInTheDocument();
  });

  it('renders table without card wrapper in compact mode', () => {
    const { getByRole, queryByTestId } = render(
      <EligibilityStatusTable
        userPreferredName="John"
        userEligible={false}
        userCountry="US"
        compact
      />,
    );

    expect(getByRole('cell', { name: 'Ineligible' })).toBeInTheDocument();
    expect(queryByTestId('eligibility-status-table')).not.toBeInTheDocument();
  });

  it('shows approved staff member message only when mixed eligibility', () => {
    const { getByTestId, queryByText } = render(
      <EligibilityStatusTable
        userPreferredName="John"
        userEligible={true}
        spousePreferredName="Jane"
        spouseEligible={false}
        spouseCountry="US"
      />,
    );

    expect(getByTestId('eligibility-contact-info')).toBeInTheDocument();
    expect(
      queryByText(/Any changes will only apply to the approved staff member/),
    ).toBeInTheDocument();
  });

  it('hides approved staff member message when all are ineligible', () => {
    const { getByTestId, queryByText } = render(
      <EligibilityStatusTable
        userPreferredName="John"
        userEligible={false}
        userCountry="US"
      />,
    );

    expect(getByTestId('eligibility-contact-info')).toBeInTheDocument();
    expect(
      queryByText(/Any changes will only apply to the approved staff member/),
    ).not.toBeInTheDocument();
  });

  it('does not render spouse column when spousePreferredName is not provided', () => {
    const { queryByRole } = render(
      <EligibilityStatusTable userPreferredName="John" userEligible={true} />,
    );

    expect(
      queryByRole('columnheader', { name: 'Jane' }),
    ).not.toBeInTheDocument();
  });
});
