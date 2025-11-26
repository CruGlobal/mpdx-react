import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { RedirectReason } from 'pages/api/auth/redirectReasonEnum';

export const useRedirectSnackbar = () => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  useEffect(() => {
    const reason = router.query.redirect as string;

    if (!reason) {
      return;
    }

    let message: string | null = null;

    if (reason === RedirectReason.Unauthorized) {
      message = t(
        'You lack the authorization to access that page. If you need to access that page, please reach out to support.',
      );
    }

    if (reason === RedirectReason.ImpersonationBlocked) {
      message = t(
        'Access to that page is blocked while impersonating. If you need to access that page, please reach out to the development team.',
      );
    }

    if (message) {
      enqueueSnackbar(message, {
        variant: 'warning',
        key: `redirect-${reason}`,
        preventDuplicate: true,
      });

      const { redirect: _redirect, ...cleanQuery } = router.query;
      router.replace(
        {
          pathname: router.pathname,
          query: cleanQuery,
        },
        undefined,
        { shallow: true },
      );
    }
  }, []);
};
