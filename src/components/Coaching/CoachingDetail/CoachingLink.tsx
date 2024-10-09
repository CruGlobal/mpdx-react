import NextLink from 'next/link';
import { Link, LinkProps as MuiLinkProps } from '@mui/material';
import { AccountListTypeEnum } from './CoachingDetail';

interface LinkProps extends MuiLinkProps {
  accountListType: AccountListTypeEnum;
  href: string;
}

/*
 * Component to show links when the account list belongs to the user and hide links when viewing a
 * coached account list.
 */
export const CoachingLink: React.FC<LinkProps> = ({
  accountListType,
  href,
  children,
  ...props
}) =>
  accountListType === AccountListTypeEnum.Own ? (
    <NextLink href={href} passHref>
      <Link {...props}>{children}</Link>
    </NextLink>
  ) : (
    <span>{children}</span>
  );
