# UX — Focus Areas

Project-specific UX/UI conventions layered on top of the UX agent's universal checks.

- **Material UI v5 conventions** — use the `sx` prop for styling; avoid `makeStyles` (legacy v4) and avoid inline `style={...}` (breaks theme-aware styling and responsive breakpoints). Styled components (`styled(...)`) are acceptable for reused patterns
- **Theme tokens, not hardcoded values** — use `theme.palette.*`, `theme.spacing(n)`, `theme.breakpoints.*`. Flag raw hex colors, pixel values, and magic numbers
- **Responsive design** — MUI breakpoints (`xs`, `sm`, `md`, `lg`, `xl`) via `sx={{ [theme.breakpoints.down('md')]: {...} }}` or the shorthand `sx={{ display: { xs: 'block', md: 'flex' } }}`. New components must render correctly at mobile breakpoints
- **Loading states** — every Apollo query must render a loading state (MUI `Skeleton` or `CircularProgress`), not render nothing or flash stale content
- **Error states** — every Apollo query must render an error state (`<Alert severity="error">` or similar). Never let an error silently render empty content
- **Formik field wiring** — use `<Field>`, `useField`, or `getFieldProps` consistently; form fields must wire `name`, `value`, `onChange`, `onBlur`, `error`, and `helperText` to the Formik state
- **Form error visibility** — validation errors must be visible next to the field (MUI `helperText` with `error` prop), not only in a toast or summary
- **Accessibility (a11y)**
  - All interactive elements need accessible names (`aria-label`, `aria-labelledby`, or visible text)
  - Icon-only buttons must have `aria-label` (MUI `IconButton` doesn't add one automatically)
  - Form fields must have associated labels (MUI `TextField` with `label` prop, or explicit `<InputLabel>` + `htmlFor`)
  - Dialogs use `<Dialog>` with `aria-labelledby` pointing at the title
  - Color should never be the only indicator of state (add icons or text)
  - Keyboard navigation works (tab order, Enter/Space activation, Escape closes modals)
- **Translation coverage** — new user-visible strings must have i18n keys added; verify `yarn extract` would pick them up (no dynamic `t()` keys, no string interpolation inside `t()`)
- **Snackbar / notification usage** — success/error feedback goes through the project's notification system, not ad-hoc `alert()` or inline text
- **Dialog UX** — dialogs have clear primary/secondary actions, disable the primary action while submitting, and close on success
