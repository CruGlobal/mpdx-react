# Design: Contact Photo Capture/Upload (Phase 4 — Apple 4.2 anchor)

Status: DESIGN — 2026-06-10
Branch: `pwa-phase3-4-push-shell`
Depends on: Capacitor shell scaffold (see `capacitor-shell.md` master plan task — adds
`@capacitor/core`, `ios/`, `android/` projects, `capacitor.config.ts` in server.url mode).

## 1. Current state (verified in code)

The contact avatar upload already works end-to-end on the web. The whole chain:

| Layer | File | Behavior |
| --- | --- | --- |
| UI trigger | `src/components/Contacts/ContactDetails/ContactDetailsTab/People/Items/PersonModal/PersonName/PersonName.tsx` | Hidden `<input type="file" accept="image/*">` (`data-testid="PersonNameUpload"`), opened by clicking the avatar `StyledIconButton`. Only rendered when `person` exists (edit mode). `handleFileChange` calls `setAvatar(file)` and resets `event.target.value`. |
| State + preview | `.../PersonModal/PersonModal.tsx` | `updateAvatar(file)` runs `validateAvatar` then stores `{ file, blobUrl: URL.createObjectURL(file) }`; `pendingAvatar` blob URL previews in the `<Avatar>`. Upload is deferred to form submit. |
| Validation | `.../PersonModal/uploadAvatar.ts` `validateAvatar` | Must be `image/*`, not AVIF, **≤ 1,000,000 bytes** (the lambda truncates bodies at 2^20 bytes — hard constraint). |
| Upload | `.../PersonModal/uploadAvatar.ts` `uploadAvatar` | **Raw `fetch` POST** (multipart `personId` + `avatar`) to `/api/uploads/upload-person-avatar`. Not Apollo. |
| Lambda | `pages/api/uploads/upload-person-avatar.page.ts` | Auths via NextAuth JWT `apiToken`, re-posts to REST `PUT contacts/people/:personId` with a `pictures` relationship (`primary: true`, `overwrite: true`). |
| Cache refresh | `PersonModal.tsx` `onSubmit` | After upload + `updatePerson`, `client.refetchQueries({ include: ['GetContactDetailsHeader'] })` (contact avatar derives from the primary person's avatar). |

Key consequences for this design:

- **Everything downstream of `setAvatar(file: File)` stays untouched.** The native
  camera path only has to produce a `File` and call the same `setAvatar`.
- **The 1MB limit is real** (lambda body truncation), so camera output must be
  resized/compressed client-side before it ever reaches `validateAvatar`.
- `uploadAvatar` is a raw `fetch`, so the Phase 2 `offlineLink` does **not** block
  it — offline behavior needs explicit handling (section 5).
- The same modal also edits the user's own profile (`userProfile` branch) — the
  camera path works there for free; no extra code.

## 2. Architecture overview

```
PersonName.tsx (extended, not forked)
 ├─ web / browser ──────────► existing <input type="file"> (UNCHANGED)
 └─ Capacitor native shell ─► MUI <Menu>: "Take Photo" / "Choose from Library"
                                 │
                                 ▼
                       useNativeCamera() hook (src/hooks/useNativeCamera.ts)
                         dynamic import('@capacitor/camera')
                         requestPermissions → getPhoto (Base64, 1024px, q85)
                         base64 → File (src/lib/images/base64ToFile.ts)
                         size/type safety net (src/lib/images/compressAvatar.ts)
                                 │
                                 ▼ File
                       setAvatar(file)  ← existing PersonModal prop
                                 │
                                 ▼ (existing, unchanged)
                       validateAvatar → preview → submit → uploadAvatar fetch
                       → /api/uploads/upload-person-avatar → REST API
```

New files (all in mpdx-react):

| File | Purpose |
| --- | --- |
| `src/lib/capacitor.ts` | `export const isNativePlatform = (): boolean => Capacitor.isNativePlatform();` — single in-repo mock point so component tests never mock `@capacitor/core` directly. Shared with the push-registration feature. |
| `src/hooks/useNativeCamera.ts` (+ test) | Reusable hook: permission flow, `getPhoto`, conversion to `File`, typed error outcomes. Lives in `src/hooks/` because push/avatar/future features share the native boundary and it is not PersonModal-specific. |
| `src/lib/images/base64ToFile.ts` (+ test) | Pure `(base64: string, mimeType: string, fileName: string) => File`. No fetch, trivially unit-testable. |
| `src/lib/images/compressAvatar.ts` (+ test) | Canvas-based safety net: re-encode to JPEG under `MAX_AVATAR_BYTES = 1_000_000` (exported constant; `validateAvatar`'s limit should be refactored to import it). |
| `PersonName.tsx` (modified, + test additions) | Branch on `isNativePlatform()`; native menu UI; offline gating; denial snackbars. |

No new third-party dependencies beyond the official `@capacitor/camera` (and
`@capacitor/core`, which the shell scaffold already adds). Deliberately **no**
`browser-image-compression`-style package — the plugin does the primary resize
natively and a small canvas util covers the rest (avoids the +2 supply-chain
risk in `.CLAUDE/rules/code-review.md`).

## 3. @capacitor/camera usage (plugin v7.x line — verify latest major at implementation)

### 3.1 Platform gating

- `Capacitor.isNativePlatform()` (via the `src/lib/capacitor.ts` wrapper) is the
  only switch. On web it returns `false` and the existing file input renders and
  behaves exactly as today — **zero behavioral change for browsers**, including
  the mobile-web PWA (which keeps `<input accept="image/*">`; mobile browsers
  already offer camera/library natively from that input).
- `@capacitor/camera` is loaded with `await import('@capacitor/camera')` inside
  the hook so it never lands in the web-critical bundle and is only evaluated on
  native. `@capacitor/core` is statically imported in `src/lib/capacitor.ts`
  (tiny, web-safe).
- We do **not** install `@ionic/pwa-elements` — the plugin's web fallback is
  never invoked because the hook is unreachable when `isNativePlatform()` is false.

### 3.2 getPhoto call

```ts
const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');

const photo = await Camera.getPhoto({
  resultType: CameraResultType.Base64,
  source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
  quality: 85,
  width: 1024,
  height: 1024,            // max bounding box; aspect ratio preserved
  correctOrientation: true, // EXIF rotation baked in
  allowEditing: false,      // native crop UIs are inconsistent; skip this release
  saveToGallery: false,
});
```

Decisions and why:

- **`CameraResultType.Base64`, not `Uri`.** The shell runs in `server.url` mode
  (webview origin = hosted mpdx.org). `Uri` results return a
  `_capacitor_file_` webPath served by Capacitor's local interceptor; on iOS
  that interception is implemented via a `WKURLSchemeHandler` on the
  `capacitor://` scheme and is **not reliable when the origin is a remote
  https URL** — `fetch(webPath)` can fail. Base64 crosses the bridge directly
  and is origin-independent. At 1024px/q85 the payload is ~150–400KB of JPEG
  (~200–530KB base64) — well within bridge limits. If profiling ever shows
  memory pressure, revisit `Uri` + `Capacitor.convertFileSrc` once the shell's
  file-serving behavior under server.url is verified on-device.
- **`width/height: 1024` + `quality: 85`** does the resize/compress natively
  (fast, low-memory, handles 12–48MP camera output). Output is JPEG-encoded by
  the plugin when resizing — this also neutralizes HEIC from iOS libraries.
- **Two explicit sources** instead of `CameraSource.Prompt`: we render our own
  MUI menu (localized, theme-consistent, testable) and call the plugin with
  `Camera` or `Photos` directly.

### 3.3 Conversion to File

```ts
// src/lib/images/base64ToFile.ts — pure, no DOM APIs
export const base64ToFile = (
  base64: string,
  mimeType: string,
  fileName: string,
): File => {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new File([bytes], fileName, { type: mimeType });
};
```

The hook names the file `avatar.${photo.format ?? 'jpeg'}` with MIME
`image/${photo.format ?? 'jpeg'}`. `validateAvatar` then re-checks type and
size exactly as it does for file-input uploads (defense in depth, no special
casing).

### 3.4 Size/type safety net — `compressAvatar`

The plugin output should virtually always be < 1MB, but "should" is not a
guarantee (PNG screenshots from the library, dense 1024px JPEGs). Rule in the
hook, after conversion:

```
if (file.size > MAX_AVATAR_BYTES || !['image/jpeg', 'image/png'].includes(file.type)) {
  file = await compressAvatar(file);
}
```

`compressAvatar` (canvas-based, in-repo):

1. `createImageBitmap(file)` → draw onto an offscreen `<canvas>` at the current
   dimensions (capped at 1024px max edge).
2. `canvas.toBlob('image/jpeg', q)` with `q` stepping `0.85 → 0.75 → 0.65 → 0.55`.
3. If still over budget at `q = 0.55`, scale dimensions by `0.75` and restart the
   quality ladder; throw a localized error after 3 dimension reductions
   (surfaces as the existing avatar-error snackbar).
4. The step sequence lives in a pure exported helper
   (`nextCompressionStep(state): CompressionStep | null`) so the ladder logic is
   unit-testable without canvas; the canvas I/O is a thin shell around it.

This util is generic and may later serve the web path too, but **this release
does not change web behavior** — web keeps the hard 1MB validation error.

## 4. Hook contract and PersonName integration

### 4.1 `useNativeCamera`

```ts
// src/hooks/useNativeCamera.ts
export type NativePhotoSource = 'camera' | 'photos';

export type NativePhotoResult =
  | { outcome: 'success'; file: File }
  | { outcome: 'canceled' }
  | { outcome: 'permission-denied'; source: NativePhotoSource }
  | { outcome: 'error'; error: Error };

export interface UseNativeCameraResult {
  isNative: boolean; // from src/lib/capacitor.ts
  getAvatarPhoto: (source: NativePhotoSource) => Promise<NativePhotoResult>;
}

export const useNativeCamera = (): UseNativeCameraResult => { ... };
```

`getAvatarPhoto` flow:

1. `Camera.requestPermissions({ permissions: [source === 'camera' ? 'camera' : 'photos'] })`
   — returns `{ camera, photos }` with states
   `'granted' | 'denied' | 'prompt' | 'prompt-with-rationale' | 'limited'`.
   - `granted` / `limited` → proceed (`limited` = iOS limited photo selection;
     the picker works, treat as granted).
   - `denied` → return `{ outcome: 'permission-denied', source }` **without**
     calling `getPhoto` (avoids the plugin's raw error string).
   - Note: on Android 13+ the `Photos` source uses the system Photo Picker and
     needs no runtime permission; `requestPermissions` resolves `granted` there.
2. `Camera.getPhoto(...)` (section 3.2).
   - The plugin rejects with a message containing "cancelled"/"canceled" when
     the user backs out of the camera/picker → match `/cancell?ed/i` → return
     `{ outcome: 'canceled' }` (no snackbar — cancel is not an error).
   - Any other rejection → `{ outcome: 'error', error }`.
3. Convert + safety-net compress → `{ outcome: 'success', file }`.

Returning a discriminated result (instead of throwing) keeps PersonName's
handler a flat `switch` and makes the test matrix explicit.

### 4.2 PersonName changes (extend, don't fork)

`PersonName.tsx` keeps its props (`setAvatar: (avatar: File) => void` is
already exactly what we need). Changes:

- `const { isNative, getAvatarPhoto } = useNativeCamera();`
  `const isOnline = useIsOnline();` (existing hook)
  `const { enqueueSnackbar } = useSnackbar();`
- `StyledIconButton.onClick`:
  - web (`!isNative`): `fileRef.current?.click()` — **unchanged line, unchanged
    hidden input, unchanged tests**.
  - native: open an MUI `<Menu>` anchored to the button with two `MenuItem`s:
    - `t('Take Photo')` — `PhotoCameraOutlined` icon → `handleNativePhoto('camera')`
    - `t('Choose from Library')` — `PhotoLibraryOutlined` icon → `handleNativePhoto('photos')`
  - Add `aria-label={t('Change photo')}` to `StyledIconButton` (it is icon-only;
    flagged-by-default in our UX rules — fixes web too, harmless).
- `handleNativePhoto(source)` switch on `NativePhotoResult.outcome`:
  - `success` → `setAvatar(file)` (existing pipeline: validate, preview, upload
    on save).
  - `canceled` → no-op.
  - `permission-denied` → snackbar `variant: 'error'`:
    - camera: `t('MPDX does not have permission to use the camera. Enable camera access for MPDX in your device settings and try again.')`
    - photos: `t('MPDX does not have permission to access your photos. Enable photo access for MPDX in your device settings and try again.')`
    - (No settings deep-link this release — that needs an extra plugin
      (`capacitor-native-settings`); copy-only guidance keeps scope down.
      Noted as a follow-up.)
  - `error` → snackbar `t('Failed to get the photo. Please try again.')`.
- The native menu is only reachable when `person` exists, same as today's input
  (the whole avatar block is inside `{person && ...}`).

All four new strings go through `t()`; run `yarn extract`.

## 5. Offline behavior (confirmed analysis)

- **`offlineLink` does NOT cover this feature.** It blocks Apollo mutations;
  `uploadAvatar` is a raw `fetch` to the Next lambda. Today, an offline submit
  with a pending avatar fails inside `uploadAvatar`'s `.catch` with the
  misleading `t('Cannot upload avatar: server error')` snackbar and aborts the
  submit — no data loss, but poor messaging. The subsequent `updatePerson`
  Apollo mutation never runs (upload throws first), so the offlineLink toast
  never appears for this path.
- **Native shell (this feature): gate at the entry point.** In `PersonName`,
  when `isNative && !isOnline`, tapping the avatar shows
  `enqueueSnackbar(t('Cannot change the photo while offline.'), { variant: 'warning' })`
  instead of opening the menu. No capture, no preview, nothing queued — clean
  degradation, consistent with the Phase 2 read-only-offline decision and the
  roadmap's "online-only, no offline upload queue".
- **Web path: untouched per scope.** The pre-existing offline failure mode
  (generic server-error snackbar) is unchanged. Optional cheap follow-up
  (separate ticket): early-return in `uploadAvatar` with
  `t('Cannot upload avatar while offline.')` when `!navigator.onLine`.

## 6. Native platform configuration (shell requirements)

Lives in the Capacitor shell projects (`ios/`, `android/` in mpdx-react, created
by the shell scaffold task).

### iOS — `ios/App/App/Info.plist`

| Key | Suggested value (App Store review reads these verbatim) |
| --- | --- |
| `NSCameraUsageDescription` | `MPDX uses the camera to take a photo for a contact or your profile.` |
| `NSPhotoLibraryUsageDescription` | `MPDX accesses your photo library so you can choose a photo for a contact or your profile.` |
| `NSPhotoLibraryAddUsageDescription` | `MPDX can save photos you take to your photo library.` — include even though `saveToGallery: false`; the plugin links the add-to-library API and App Store static analysis rejects builds with linked-but-undescribed APIs. |

Also: iOS Privacy Manifest (`PrivacyInfo.xcprivacy`) — `@capacitor/camera` 7.x
ships its own; verify it is present in the Pods build and declare photo-library
access in the App Store privacy labels (data not collected — photo goes straight
to MPDX's existing avatar storage).

### Android — `android/app/src/main/AndroidManifest.xml`

```xml
<!-- Legacy storage access for the photo picker on older devices (per @capacitor/camera docs) -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29"/>
```

- **Do NOT declare `android.permission.CAMERA`.** The plugin captures via the
  system camera intent; if `CAMERA` appears in the merged manifest, Android then
  *requires* the runtime grant before the intent fires — declaring it strictly
  worsens UX. Audit the merged manifest (`./gradlew :app:processDebugManifest`)
  in case another plugin adds it.
- Android 13+ (API 33+): no `READ_MEDIA_IMAGES` needed — the plugin uses the
  system Photo Picker, permissionless by design.
- The Capacitor Android template already ships the required `FileProvider`
  entry; no change.
- Google Play Data Safety: declare "Photos" collected, transmitted, not shared.

## 7. TDD plan (per project conventions)

Order of implementation = order below; write the failing test first in each step.
All mocks of Capacitor go through `jest.mock('src/lib/capacitor')` and
`jest.mock('@capacitor/camera')` — never mock `window.fetch` (existing
`uploadAvatar.test.ts` already covers the upload fetch; we don't touch it).

1. **`src/lib/images/base64ToFile.test.ts`** (pure):
   - decodes a known base64 string to a `File` with correct bytes, name, MIME;
   - empty string → empty file (no throw).
2. **`src/lib/images/compressAvatar.test.ts`**:
   - unit-test the pure `nextCompressionStep` ladder: quality descends
     0.85→0.55, then dimension scales by 0.75, `null` (give up) after 3
     dimension reductions;
   - canvas shell: mock `createImageBitmap` + `HTMLCanvasElement.prototype.toBlob`
     (jsdom has no real canvas) — returns first blob under `MAX_AVATAR_BYTES`,
     throws localized error when ladder exhausts.
3. **`src/hooks/useNativeCamera.test.tsx`** (`renderHook`):
   - `jest.mock('@capacitor/camera')` with `Camera.requestPermissions` /
     `Camera.getPhoto` spies; `jest.mock('src/lib/capacitor')` for `isNativePlatform`.
   - success (camera): permissions `granted` → `getPhoto` called with
     `source: CameraSource.Camera`, `resultType: Base64`, `width/height: 1024`,
     `quality: 85`, `saveToGallery: false` → result `success` with
     `File` of type `image/jpeg`;
   - success (photos): `source: CameraSource.Photos`; `limited` permission
     treated as granted;
   - permission denied (each source) → `permission-denied`, `getPhoto` NOT called;
   - user cancel (`getPhoto` rejects with `'User cancelled photos app'`) → `canceled`;
   - other rejection → `error`;
   - oversize/odd-type result → `compressAvatar` invoked (mock it) and its
     output returned.
4. **`PersonName.test.tsx`** (extend the existing test file):
   - **web regression (the load-bearing test)**: `isNativePlatform` → `false` ⇒
     clicking the avatar button does NOT render a menu; the hidden
     `PersonNameUpload` input still receives the click; `fireEvent.change` with
     a `File` still calls `setAvatar` — proves the browser path is byte-for-byte
     behaviorally unchanged;
   - native ⇒ menu renders `Take Photo` and `Choose from Library`
     (`findByRole('menuitem', ...)`);
   - selecting `Take Photo` with hook mocked to `success` ⇒ `setAvatar` called
     with the returned `File`;
   - `permission-denied` (camera and photos) ⇒ correct error snackbar
     (mock `notistack`'s `useSnackbar` per existing repo pattern), `setAvatar`
     not called;
   - `canceled` ⇒ no snackbar, no `setAvatar`;
   - native + offline (`useIsOnline` mocked false / `window` online event
     pattern from `useIsOnline.test.tsx`) ⇒ tapping avatar shows the offline
     warning snackbar and no menu.
5. **`PersonModalSave.test.tsx`** (existing integration suite): one added case —
   a camera-shaped `File` (`avatar.jpeg`, `image/jpeg`, < 1MB) passed through
   `setAvatar` survives `validateAvatar` and reaches the `uploadAvatar` POST on
   save (asserts the bridge output is compatible with the legacy validator).
6. **Manual device QA checklist** (no automation possible): iOS + Android shell —
   capture, library pick, deny-then-recover via Settings, airplane mode,
   12MP+ source photo lands < 1MB server-side, avatar refreshes on contact
   header after save (`GetContactDetailsHeader` refetch).

`yarn lint`, `yarn lint:ts`, `yarn extract` (4 new strings) gate each step.

## 8. Risks

- **server.url + `Uri` webPath incompatibility** is designed around via Base64,
  but Base64 bridges a few hundred KB per capture — acceptable, verify on a
  low-end Android device.
- **1MB lambda truncation** is inherited, not fixed. The compress ladder makes
  hitting it unlikely; raising the lambda limit is a separate backend ticket if
  QA finds real photos failing.
- **Plugin major-version drift**: pin `@capacitor/camera` to the same major as
  `@capacitor/core` chosen by the shell scaffold; CI native builds (Fastlane
  task in the shell plan) catch mismatches.
- **Merged-manifest CAMERA permission** from a future plugin would silently
  change Android permission semantics — add a checklist item to the shell's
  release checklist.

## 9. Out of scope / follow-ups

- Settings deep-link on permission denial (`capacitor-native-settings`).
- Offline-aware copy in the web `uploadAvatar` path (cheap, separate ticket).
- `allowEditing: true` native crop UX.
- Refactor `validateAvatar`'s magic `1_000_000` to import `MAX_AVATAR_BYTES`
  from `compressAvatar.ts` (do during T2 — single source of truth).
