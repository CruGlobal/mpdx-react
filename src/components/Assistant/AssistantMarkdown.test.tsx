import React from 'react';
import { render } from '@testing-library/react';
import { AssistantMarkdown } from './AssistantMarkdown';

describe('AssistantMarkdown', () => {
  it('renders markdown and gfm', () => {
    const { getByText, getByRole } = render(
      <AssistantMarkdown>
        {'**Bold** text\n\n| A | B |\n| - | - |\n| 1 | 2 |'}
      </AssistantMarkdown>,
    );

    expect(getByText('Bold').tagName).toBe('STRONG');
    expect(getByRole('table')).toBeInTheDocument();
  });

  it('opens links in a new tab', () => {
    const { getByRole } = render(
      <AssistantMarkdown>{'[Help](https://help.test/1)'}</AssistantMarkdown>,
    );

    const link = getByRole('link', { name: 'Help' });
    expect(link).toHaveAttribute('href', 'https://help.test/1');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not render raw html', () => {
    const { container } = render(
      <AssistantMarkdown>
        {'<script>alert(1)</script><b onclick="x()">raw</b>'}
      </AssistantMarkdown>,
    );

    expect(container.querySelector('script')).not.toBeInTheDocument();
    expect(container.querySelector('b')).not.toBeInTheDocument();
  });

  it('drops javascript links', () => {
    const { getByText } = render(
      <AssistantMarkdown>{'[Click](javascript:alert(1))'}</AssistantMarkdown>,
    );

    expect(getByText('Click').closest('a')).not.toHaveAttribute(
      'href',
      expect.stringContaining('javascript'),
    );
  });

  it('does not load images', () => {
    const { container } = render(
      <AssistantMarkdown>
        {'![pixel](https://tracker.test/p.png)'}
      </AssistantMarkdown>,
    );

    expect(container.querySelector('img')).not.toBeInTheDocument();
  });
});
