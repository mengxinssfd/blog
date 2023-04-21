const rootClasses = document.documentElement.classList;
if (!rootClasses.contains('dark') && !rootClasses.contains('light')) {
  rootClasses.add(window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
}
