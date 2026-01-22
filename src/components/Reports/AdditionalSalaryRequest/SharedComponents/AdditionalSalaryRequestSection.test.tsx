import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdditionalSalaryRequestSection } from './AdditionalSalaryRequestSection';

describe('AdditionalSalaryRequestSection', () => {
  it('renders children', () => {
    const { getByText } = render(
      <AdditionalSalaryRequestSection>
        <div>Test Content</div>
      </AdditionalSalaryRequestSection>,
    );

    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    const { getByRole } = render(
      <AdditionalSalaryRequestSection title="Section Title">
        <div>Content</div>
      </AdditionalSalaryRequestSection>,
    );

    expect(getByRole('heading', { name: 'Section Title' })).toBeInTheDocument();
  });

  it('does not render title when not provided', () => {
    const { queryByRole } = render(
      <AdditionalSalaryRequestSection>
        <div>Content</div>
      </AdditionalSalaryRequestSection>,
    );

    expect(queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders titleExtra when provided', () => {
    const { getByText } = render(
      <AdditionalSalaryRequestSection titleExtra={<span>Extra Info</span>}>
        <div>Content</div>
      </AdditionalSalaryRequestSection>,
    );

    expect(getByText('Extra Info')).toBeInTheDocument();
  });

  it('renders print button when printable is true', () => {
    const { getByRole } = render(
      <AdditionalSalaryRequestSection printable>
        <div>Content</div>
      </AdditionalSalaryRequestSection>,
    );

    expect(getByRole('button', { name: 'Print' })).toBeInTheDocument();
  });

  it('does not render print button when printable is false', () => {
    const { queryByRole } = render(
      <AdditionalSalaryRequestSection printable={false}>
        <div>Content</div>
      </AdditionalSalaryRequestSection>,
    );

    expect(queryByRole('button', { name: 'Print' })).not.toBeInTheDocument();
  });

  it('does not render print button by default', () => {
    const { queryByRole } = render(
      <AdditionalSalaryRequestSection>
        <div>Content</div>
      </AdditionalSalaryRequestSection>,
    );

    expect(queryByRole('button', { name: 'Print' })).not.toBeInTheDocument();
  });

  it('calls window.print when print button is clicked', async () => {
    const printSpy = jest.spyOn(window, 'print').mockImplementation(() => {});

    const { getByRole } = render(
      <AdditionalSalaryRequestSection printable>
        <div>Content</div>
      </AdditionalSalaryRequestSection>,
    );

    await userEvent.click(getByRole('button', { name: 'Print' }));

    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });
});
