import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useGetDefaultAccountQuery } from 'pages/api/getDefaultAccount.generated';
import Loading from 'src/components/Loading';
import { useOptionalAccountListId } from 'src/hooks/useAccountListId';

interface Props {
  children: React.ReactElement;
}

// The client-side version of handleUnderscoreAccountListRedirect for pages
// without getServerSideProps: "_" in place of the account list id means the
// user's default account list
export const DefaultAccountListRedirect: React.FC<Props> = ({ children }) => {
  const { asPath, replace } = useRouter();
  const isPlaceholder = useOptionalAccountListId() === '_';
  const { data, error } = useGetDefaultAccountQuery({ skip: !isPlaceholder });

  useEffect(() => {
    if (!isPlaceholder || (!data && !error)) {
      return;
    }

    const defaultAccountList = data?.user.defaultAccountList;
    replace(
      defaultAccountList
        ? asPath.replace(
            /^\/accountLists\/_/,
            `/accountLists/${defaultAccountList}`,
          )
        : '/accountLists',
    );
  }, [isPlaceholder, data, error, asPath, replace]);

  return isPlaceholder ? <Loading loading /> : children;
};
