# Native icon & splash source assets

Source artwork for `@capacitor/assets`, which generates the iOS and Android
app icons and splash screens (capacitor-shell.md §9).

- `logo.png` — 1024×1024, upscaled from the existing maskable PWA icon
  (`public/icons/icon-512x512.png`). Same artwork, full-bleed `#05699B`
  background. If the brand artwork changes, regenerate this file from the new
  512 maskable icon (or better, a native ≥1024px source) and re-run the
  command below.

## Regenerating

```bash
npx capacitor-assets generate --ios --android \
  --iconBackgroundColor '#05699B' --iconBackgroundColorDark '#05699B' \
  --splashBackgroundColor '#05699B' --splashBackgroundColorDark '#05699B'
```

The background hex `#05699B` is `theme.palette.primary.main`
(`mpdxColors.blue` in `src/theme.ts`) — the `@capacitor/assets` CLI cannot
import TypeScript theme tokens, so the value is documented here and guarded
against drift by `src/lib/nativeShell/nativeChrome.test.ts`. The corner
pixels of `logo.png` are exactly this color, so the centered splash logo
blends seamlessly into the splash background.

Generated output lands in `ios/App/App/Assets.xcassets/` and
`android/app/src/main/res/` and is committed; regeneration is only needed
when the artwork or brand color changes (native release required either way —
see capacitor-shell.md §10).
