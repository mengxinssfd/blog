export class Token {
  private static KEY = 'token';

  static set key(key: string) {
    Token.KEY = key;
  }

  static get key(): string {
    return Token.KEY;
  }

  static get(): string {
    // return localStorage.getItem(Token.KEY) || '';
    return useCookie(Token.key)?.value || '';
  }

  static set(token: string) {
    // localStorage.setItem(Token.KEY, token);
    try {
      const expires = new Date();
      expires.setDate(expires.getDate() + 1);
      const cookie = useCookie(Token.key, { expires });
      cookie.value = token;
    } catch (e) {
      console.log('set token error', e);
    }
  }

  static clear() {
    // localStorage.removeItem(Token.KEY);
    const expires = new Date();
    expires.setDate(expires.getDate() - 1);
    const cookie = useCookie(Token.key, { expires });
    cookie.value = '';
  }

  static exists(): boolean {
    return Boolean(Token.get());
  }
}
