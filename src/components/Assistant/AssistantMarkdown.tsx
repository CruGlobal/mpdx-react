import React from 'react';
import { Box, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import Markdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toSafeHttpUrl } from './safeUrl';

const monospace = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

// Each element sets the user bubble's body2 type itself, so a reply reads exactly like the question
const MarkdownBody = styled(Box)(({ theme }) => {
  const { fontFamily, fontWeight, fontSize, lineHeight } =
    theme.typography.body2;
  const bodyType = { fontFamily, fontWeight, fontSize, lineHeight };

  return {
    ...bodyType,
    overflowWrap: 'anywhere',
    '& > :first-of-type': { marginTop: 0 },
    '& > :last-child': { marginBottom: 0 },
    '& p, & li, & a, & blockquote, & th, & td, & strong, & em': bodyType,
    '& strong': { fontWeight: theme.typography.fontWeightBold },
    '& p, & ul, & ol, & pre, & blockquote, & table': {
      margin: theme.spacing(1, 0),
    },
    '& ul, & ol': { paddingLeft: theme.spacing(3) },
    '& pre': {
      padding: theme.spacing(1),
      overflowX: 'auto',
      backgroundColor: theme.palette.action.hover,
      borderRadius: theme.shape.borderRadius,
    },
    '& code, & pre code': {
      fontFamily: monospace,
      fontSize,
      lineHeight,
    },
    '& blockquote': {
      paddingLeft: theme.spacing(1.5),
      borderLeft: `3px solid ${theme.palette.divider}`,
      color: theme.palette.text.secondary,
    },
    '& table': { borderCollapse: 'collapse' },
    '& th, & td': {
      padding: theme.spacing(0.5, 1),
      border: `1px solid ${theme.palette.divider}`,
    },
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      ...bodyType,
      margin: theme.spacing(1.5, 0, 0.5),
      fontSize: theme.typography.subtitle1.fontSize,
      fontWeight: theme.typography.fontWeightBold,
    },
  };
});

interface MarkdownNode {
  type: string;
  value?: string;
  url?: string;
  children?: MarkdownNode[];
}

const helpDeskPattern = /\b(?:MPDX\s+)?help\s?desk\b/gi;
const unlinkable = new Set(['link', 'linkReference', 'inlineCode', 'code']);

const linkText = (value: string, url: string): MarkdownNode[] =>
  value
    .split(new RegExp(`(${helpDeskPattern.source})`, 'gi'))
    .filter(Boolean)
    .map((part) =>
      new RegExp(`^${helpDeskPattern.source}$`, 'i').test(part)
        ? { type: 'link', url, children: [{ type: 'text', value: part }] }
        : { type: 'text', value: part },
    );

const linkHelpDesk = (node: MarkdownNode, url: string): void => {
  if (!node.children || unlinkable.has(node.type)) {
    return;
  }
  node.children = node.children.flatMap((child) => {
    if (child.type === 'text' && child.value) {
      return linkText(child.value, url);
    }
    linkHelpDesk(child, url);
    return [child];
  });
};

// A remark plugin, so mentions inside links and code stay as they are
const remarkHelpDeskLinks = (url: string) => () => (tree: MarkdownNode) =>
  linkHelpDesk(tree, url);

const components: Components = {
  a: ({ href, children }) => {
    const safeHref = href ? toSafeHttpUrl(href) : null;
    return safeHref ? (
      <Link href={safeHref} target="_blank" rel="noopener noreferrer">
        {children}
      </Link>
    ) : (
      <span>{children}</span>
    );
  },
};

interface AssistantMarkdownProps {
  children: string;
  // Turns mentions of the help desk into links when the reply carries a hand-off card
  helpDeskUrl?: string | null;
}

// Raw HTML is never parsed without rehype-raw; images are dropped so an answer cannot load remote URLs
export const AssistantMarkdown: React.FC<AssistantMarkdownProps> = ({
  children,
  helpDeskUrl,
}) => (
  <MarkdownBody>
    <Markdown
      remarkPlugins={
        helpDeskUrl
          ? [remarkGfm, remarkHelpDeskLinks(helpDeskUrl)]
          : [remarkGfm]
      }
      components={components}
      disallowedElements={['img']}
    >
      {children}
    </Markdown>
  </MarkdownBody>
);
