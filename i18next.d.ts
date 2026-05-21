// Narrow react-i18next's `t()` return type to `string`. Without this,
// TFunction's TDefaultResult widens to `TFunctionResult | ReactNode`,
// which doesn't satisfy MUI props like `aria-label: string | undefined`.
//
// Remove this file once i18next is upgraded to v22+ and react-i18next to v12+,
// where `t()` returns `string` by default and this workaround is unnecessary.
import 'react-i18next';

declare module 'react-i18next' {
  interface Resources {
    translation: Record<string, string>;
  }
}
