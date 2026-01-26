import { render } from '@testing-library/react';
import { SectionPage } from './SectionPage';

describe('SectionPage', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <SectionPage>
        <div>Test Child 1</div>
        <div>Test Child 2</div>
      </SectionPage>,
    );

    expect(getByText('Test Child 1')).toBeInTheDocument();
    expect(getByText('Test Child 2')).toBeInTheDocument();
  });

  it('renders without children', () => {
    const { container } = render(<SectionPage />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders as a Stack component with spacing', () => {
    const { container } = render(
      <SectionPage>
        <div>Child</div>
      </SectionPage>,
    );

    const stack = container.firstChild as HTMLElement;
    expect(stack).toHaveClass('MuiStack-root');
  });
});
