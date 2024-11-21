import NextLink from 'next/link';
import { Link, LinkProps as MuiLinkProps } from '@mui/material';
import { AccountListTypeEnum } from './CoachingDetail';

interface LinkProps extends MuiLinkProps {
  accountListType: AccountListTypeEnum;
}

/*
 * Component to show links when the account list belongs to the user and hide links when viewing a
 * coached account list.
 */
export const CoachingLink: React.FC<LinkProps> = ({
  accountListType,
  children,
  ...props
}) =>
  accountListType === AccountListTypeEnum.Own ? (
    <Link component={NextLink} {...props}>
      {children}
    </Link>
  ) : (
    <span>{children}</span>
  );
