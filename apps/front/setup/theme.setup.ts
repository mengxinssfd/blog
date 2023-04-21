export enum Theme {
  light = 'light',
  dark = 'dark',
}
export enum ThemeMode {
  light = 'light',
  dark = 'dark',
  system = 'system',
}

export enum ThemeKeys {
  type = 'theme.type',
  mode = 'theme.mode',
}

const themeSetup = () => {
  const media = process.client ? window.matchMedia('(prefers-color-scheme:dark)') : undefined;

  const userThemeMode = useCookie<ThemeMode>('theme_mode');
  const themeMode = useState<ThemeMode>(
    ThemeKeys.mode,
    () => userThemeMode.value || ThemeMode.system,
  );
  const theme = useState<Theme>(ThemeKeys.type, getThemeType);

  watch(themeMode, () => {
    theme.value = getThemeType();
    userThemeMode.value = themeMode.value;
  });

  function getThemeType(): Theme {
    switch (themeMode.value) {
      case ThemeMode.dark:
      case ThemeMode.light:
        return Theme[themeMode.value];
      case ThemeMode.system:
        return media?.matches ? Theme.dark : Theme.light;
    }
  }

  function systemThemeChangeHandler() {
    if (themeMode.value !== ThemeMode.system) return;
    theme.value = media?.matches ? Theme.dark : Theme.light;
  }

  onUnmounted(() => {
    media?.removeEventListener('change', systemThemeChangeHandler);
  });
  onMounted(() => {
    media?.addEventListener('change', systemThemeChangeHandler);
  });
};

export default themeSetup;
