// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

const key = {
  fullscreenEnabled: 0,
  fullscreenElement: 1,
  requestFullscreen: 2,
  exitFullscreen: 3,
  fullscreenchange: 4,
  fullscreenerror: 5,
} as const;

const webkit = [
  'webkitFullscreenEnabled',
  'webkitFullscreenElement',
  'webkitRequestFullscreen',
  'webkitExitFullscreen',
  'webkitfullscreenchange',
  'webkitfullscreenerror',
];

const moz = [
  'mozFullScreenEnabled',
  'mozFullScreenElement',
  'mozRequestFullScreen',
  'mozCancelFullScreen',
  'mozfullscreenchange',
  'mozfullscreenerror',
];

const ms = [
  'msFullscreenEnabled',
  'msFullscreenElement',
  'msRequestFullscreen',
  'msExitFullscreen',
  'MSFullscreenChange',
  'MSFullscreenError',
];

const standard = [
  'fullscreenEnabled',
  'fullscreenElement',
  'requestFullscreen',
  'exitFullscreen',
  'fullscreenChange',
  'fullscreenError',
] as const;

// so it doesn't throw if no window or document
const doc = globalThis?.document || ({} as Document);

const vendor = (('fullscreenEnabled' in doc && Object.keys(key)) ||
  (webkit[0] in doc && webkit) ||
  (moz[0] in doc && moz) ||
  (ms[0] in doc && ms) ||
  standard) as typeof standard;

const onfullscreenchange = (
  'on' + vendor[key.fullscreenchange]
).toLowerCase() as 'onfullscreenchange';
const onfullscreenerror = ('on' + vendor[key.fullscreenerror]).toLowerCase() as 'onfullscreenerror';

export const fscreen = {
  requestFullscreen(element: HTMLElement) {
    return element[vendor[key.requestFullscreen]]();
  },

  requestFullscreenFunction(element: HTMLElement) {
    return element[vendor[key.requestFullscreen]];
  },

  exitFullscreen() {
    return doc[vendor[key.exitFullscreen]].bind(doc);
  },

  addEventListener(
    type: keyof typeof key,
    handler: (this: Document, e: Event) => any,
    options?: Parameters<typeof doc.addEventListener>[2],
  ) {
    doc.addEventListener(vendor[key[type]], handler, options);
  },

  removeEventListener(type: keyof typeof key, handler: (this: Document, e: Event) => any) {
    return doc.removeEventListener(vendor[key[type]], handler);
  },

  get fullscreenEnabled() {
    return Boolean(doc[vendor[key.fullscreenEnabled]]);
  },

  set fullscreenEnabled(val: boolean) {
    (doc as any)[vendor[key.fullscreenEnabled]] = val;
  },

  get fullscreenElement() {
    return doc[vendor[key.fullscreenElement]];
  },

  get onfullscreenchange() {
    return doc[onfullscreenchange];
  },

  set onfullscreenchange(handler: typeof doc.onfullscreenchange) {
    doc[onfullscreenchange] = handler;
  },

  get onfullscreenerror() {
    return doc[onfullscreenerror];
  },

  set onfullscreenerror(handler: typeof doc.onfullscreenerror) {
    doc[onfullscreenerror] = handler;
  },
};
