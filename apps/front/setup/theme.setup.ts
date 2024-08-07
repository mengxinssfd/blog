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

  watch(theme, changeThemeColor);

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

  // 由于系统默认主题时server默认light(media?.matches ? Theme.dark : Theme.light)
  // 所以在client要获取一次系统主题
  onMounted(() => {
    theme.value = getThemeType();
    changeThemeColor();
  });

  function systemThemeChangeHandler() {
    if (themeMode.value !== ThemeMode.system) return;
    theme.value = media?.matches ? Theme.dark : Theme.light;
  }
  function changeThemeColor() {
    if (process.client) {
      const m = document.getElementsByTagName('meta');
      const themeColor = (m as unknown as Record<string, HTMLMetaElement>)['theme-color'];
      // theme-color 只在 safari 浏览器并且屏幕非黑夜模式才会有效
      themeColor && (themeColor.content = theme.value === 'light' ? 'white' : '#323335');
    }
  }

  onUnmounted(() => {
    media?.removeEventListener('change', systemThemeChangeHandler);
  });
  onMounted(() => {
    media?.addEventListener('change', systemThemeChangeHandler);
  });
};

export default themeSetup;
