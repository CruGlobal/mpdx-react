import { readFileSync } from 'fs';
import path from 'path';
import {
  mockCapacitorCore,
  mockSplashScreen,
  mockStatusBar,
  setNativePlatform,
} from '__tests__/util/capacitorMocks';
import theme from 'src/theme';
import { applyStatusBarStyle, hideSplashScreen } from './nativeChrome';

jest.mock('@capacitor/core', () => mockCapacitorCore);
jest.mock('@capacitor/splash-screen', () => ({
  SplashScreen: mockSplashScreen,
}));
// requireActual would load the real plugin, which imports @capacitor/core
// before the mocks above initialize — so re-declare the tiny enum inline.
jest.mock('@capacitor/status-bar', () => ({
  StatusBar: mockStatusBar,
  Style: { Dark: 'DARK', Light: 'LIGHT', Default: 'DEFAULT' },
}));

describe('nativeChrome', () => {
  beforeEach(() => {
    setNativePlatform('web');
  });

  describe('hideSplashScreen', () => {
    it('is a no-op on web', async () => {
      await hideSplashScreen();

      expect(mockSplashScreen.hide).not.toHaveBeenCalled();
    });

    it.each(['ios', 'android'] as const)(
      'hides the native splash screen on %s',
      async (platform) => {
        setNativePlatform(platform);

        await hideSplashScreen();

        expect(mockSplashScreen.hide).toHaveBeenCalledTimes(1);
      },
    );
  });

  describe('applyStatusBarStyle', () => {
    it('is a no-op on web', async () => {
      await applyStatusBarStyle();

      expect(mockStatusBar.setStyle).not.toHaveBeenCalled();
      expect(mockStatusBar.setBackgroundColor).not.toHaveBeenCalled();
      expect(mockStatusBar.setOverlaysWebView).not.toHaveBeenCalled();
    });

    it('sets light status bar text on iOS without Android-only calls', async () => {
      setNativePlatform('ios');

      await applyStatusBarStyle();

      expect(mockStatusBar.setStyle).toHaveBeenCalledWith({
        style: 'DARK',
      });
      // setBackgroundColor and setOverlaysWebView are Android-only in
      // @capacitor/status-bar and reject on iOS
      expect(mockStatusBar.setBackgroundColor).not.toHaveBeenCalled();
      expect(mockStatusBar.setOverlaysWebView).not.toHaveBeenCalled();
    });

    it('matches the app bar theme token and disables overlay on Android', async () => {
      setNativePlatform('android');

      await applyStatusBarStyle();

      expect(mockStatusBar.setStyle).toHaveBeenCalledWith({
        style: 'DARK',
      });
      expect(mockStatusBar.setOverlaysWebView).toHaveBeenCalledWith({
        overlay: false,
      });
      expect(mockStatusBar.setBackgroundColor).toHaveBeenCalledWith({
        color: theme.palette.mpdxGrayDark.main,
      });
    });
  });

  describe('native assets documentation', () => {
    it('assets/README.md regeneration command uses the current theme primary color', () => {
      // The @capacitor/assets CLI cannot import src/theme.ts, so the splash/
      // icon background hex lives in the documented command. This drift guard
      // keeps it equal to theme.palette.primary.main (theme-token rule,
      // capacitor-shell.md §9).
      const readme = readFileSync(
        path.join(process.cwd(), 'assets/README.md'),
        'utf-8',
      );

      expect(readme.toLowerCase()).toContain(
        String(theme.palette.primary.main).toLowerCase(),
      );
    });
  });
});
