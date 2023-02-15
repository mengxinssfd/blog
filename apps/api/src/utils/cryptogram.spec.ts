import { makeSalt, encryptPassword } from './cryptogram';

describe('cryptogram', () => {
  it('makeSalt', () => {
    const arr = [...Array(20)].map(() => makeSalt());
    arr.forEach((item) => {
      expect(item).toMatch(/^\S{4}$/);
    });
  });
  it('encryptPassword', () => {
    expect(encryptPassword('123456', '/ak3')).toBe('PS+ZcVq+LbMmnw1MHaH+vA==');
  });
});
