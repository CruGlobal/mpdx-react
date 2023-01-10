import NextLink from 'next/link';
import HandoffLink from 'src/components/HandoffLink';

export interface ReportLinkProps {
  id: string;
  accountListId: string;
  children: JSX.Element;
}

export const ReportLink: React.FC<ReportLinkProps> = ({
  id,
  accountListId,
  children,
}) => {
  if (id === 'coaching') {
    return <HandoffLink path="/reports/coaching">{children}</HandoffLink>;
  } else {
    return (
      <NextLink href={`/accountLists/${accountListId}/reports/${id}`}>
        {children}
      </NextLink>
    );
  }
};
