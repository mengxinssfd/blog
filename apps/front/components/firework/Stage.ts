// New Features
// ------------------
// - Proper multitouch support!

// Breaking changes
// ------------------
// - No longer uses preventDefault() in touch handler.
// - <canvas> elements have `touchAction: auto` style applied.

// Inlined Stage.js dependency: Ticker.js

/**
 * Ticker.js
 * -----------
 * requestAnimationFrame helper. Provides elapsed time between frames and a lag compensation multiplier to callbacks.
 *
 * Author: Caleb Miller
 *         caleb@caleb-miller.com
 */

import { Ticker } from './Ticker';

/**
 * Stage.js
 * -----------
 * Super simple "stage" abstraction for canvas. Combined with Ticker.js, it helps simplify:
 *   - Preparing a canvas for drawing.
 *   - High resolution rendering.
 *   - Resizing the canvas.
 *   - Pointer events (mouse and touch).
 *   - Frame callbacks with useful timing data and calculated lag.
 *
 * This is no replacement for robust canvas drawing libraries; it's designed to be as lightweight as possible and defers
 * full rendering burden to user.
 *
 * Author: Caleb Miller
 *         caleb@caleb-miller.com
 */

let lastTouchTimestamp = 0;

export class Stage {
  static stages: Stage[] = [];
  static disableHighDPI = false;

  private canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  private speed: number;
  dpr: number;
  width: number;
  height: number;
  private naturalWidth: number;
  private naturalHeight: number;
  private _listeners: {
    // canvas resizing
    resize: Function[];
    // pointer events
    pointerstart: Function[];
    pointermove: Function[];
    pointerend: Function[];
    lastPointerPos: { x: number; y: number };
  };

  static windowToCanvas(canvas: HTMLCanvasElement, x: number, y: number) {
    const bbox = canvas.getBoundingClientRect();
    return {
      x: (x - bbox.left) * (canvas.width / bbox.width),
      y: (y - bbox.top) * (canvas.height / bbox.height),
    };
  }
  static mouseHandler(evt: MouseEvent) {
    // Prevent mouse events from firing immediately after touch events
    if (Date.now() - lastTouchTimestamp < 500) {
      return;
    }

    let type: 'start' | 'move' | 'end' = 'start';
    if (evt.type === 'mousemove') {
      type = 'move';
    } else if (evt.type === 'mouseup') {
      type = 'end';
    }

    Stage.stages.forEach((stage) => {
      const pos = Stage.windowToCanvas(stage.canvas, evt.clientX, evt.clientY);
      stage.pointerEvent(type, pos.x / stage.dpr, pos.y / stage.dpr);
    });
  }
  static touchHandler(evt: TouchEvent) {
    lastTouchTimestamp = Date.now();

    // Set generic event type
    let type: 'start' | 'move' | 'end' = 'start';
    if (evt.type === 'touchmove') {
      type = 'move';
    } else if (evt.type === 'touchend') {
      type = 'end';
    }

    // Dispatch "pointer events" for all changed touches across all stages.
    Stage.stages.forEach((stage) => {
      // Safari doesn't treat a TouchList as an iteratable, hence Array.from()
      for (const touch of Array.from(evt.changedTouches)) {
        let pos;
        if (type !== 'end') {
          pos = Stage.windowToCanvas(stage.canvas, touch.clientX, touch.clientY);
          stage._listeners.lastPointerPos = pos;
          // before touchstart event, fire a move event to better emulate cursor events
          if (type === 'start') stage.pointerEvent('move', pos.x / stage.dpr, pos.y / stage.dpr);
        } else {
          // on touchend, fill in position information based on last known touch location
          pos = stage._listeners.lastPointerPos;
        }
        stage.pointerEvent(type, pos.x / stage.dpr, pos.y / stage.dpr);
      }
    });
  }

  constructor(canvas: HTMLCanvasElement | string) {
    const _canvas =
      typeof canvas === 'string' ? (document.getElementById(canvas) as HTMLCanvasElement) : canvas;

    // canvas and associated context references
    this.canvas = _canvas;
    const ctx = (this.ctx = _canvas.getContext('2d')!);

    // Prevent gestures on stages (scrolling, zooming, etc)
    this.canvas.style.touchAction = 'none';

    // physics speed multiplier: allows slowing down or speeding up simulation (must be manually implemented in physics layer)
    this.speed = 1;

    // devicePixelRatio alias (should only be used for rendering, physics shouldn't care)
    // avoids rendering unnecessary pixels that browser might handle natively via CanvasRenderingContext2D.backingStorePixelRatio
    this.dpr = Stage.disableHighDPI
      ? 1
      : (window.devicePixelRatio || 1) / ((ctx as any).backingStorePixelRatio || 1);

    // canvas size in DIPs and natural pixels
    this.width = _canvas.width;
    this.height = _canvas.height;
    this.naturalWidth = this.width * this.dpr;
    this.naturalHeight = this.height * this.dpr;

    // size canvas to match natural size
    if (this.width !== this.naturalWidth) {
      this.canvas.width = this.naturalWidth;
      this.canvas.height = this.naturalHeight;
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
    }

    // To any known illigitimate users...
    const badDomains = ['bla' + 'ckdiam' + 'ondfirew' + 'orks' + '.de'];
    const hostname = document.location.hostname;
    if (badDomains.some((d) => hostname.includes(d))) {
      const delay = 60000 * 3; // 3 minutes
      setTimeout(() => {
        const html =
          `<sty` +
          `le>
` +
          `				` +
          `		bo` +
          `dy { bac` +
          `kgrou` +
          `nd-colo` +
          `r: #000;` +
          ` padd` +
          `ing: ` +
          `20px; text-` +
          `align:` +
          ` center; col` +
          `or: ` +
          `#ddd` +
          `; mi` +
          `n-he` +
          `ight` +
          `: 10` +
          `0vh;` +
          ` dis` +
          `play` +
          `: fl` +
          `ex; ` +
          `flex` +
          `-dir` +
          `ecti` +
          `on: ` +
          `colu` +
          `mn; ` +
          `just` +
          `ify-` +
          `cont` +
          `ent:` +
          ` cen` +
          `ter;` +
          ` ali` +
          `gn-i` +
          `tems` +
          `: ce` +
          `nter` +
          `; ov` +
          `erfl` +
          `ow: ` +
          `visi` +
          `ble;` +
          ` }
	` +
          `				` +
          `	h1 ` +
          `{ fo` +
          `nt-s` +
          `ize:` +
          ` 1.2` +
          `em;` +
          `}
		` +
          `				` +
          `p { ` +
          `marg` +
          `in-t` +
          `op: ` +
          `1em;` +
          ` max` +
          `-wid` +
          `th: ` +
          `36em` +
          `; }
` +
          `				` +
          `		a ` +
          `{ co` +
          `lor:` +
          ` #ff` +
          `f; tex` +
          `t-dec` +
          `orati` +
          `on: u` +
          `nderl` +
          `ine; }` +
          `
			` +
          `		</` +
          `styl` +
          `e>
	` +
          `				` +
          `<h1>` +
          `Hi! ` +
          `Sorr` +
          `y to` +
          ` int` +
          `erru` +
          `pt t` +
          `he f` +
          `irew` +
          `orks` +
          `.</h` +
          `1>
	` +
          `				` +
          `<p>M` +
          `y na` +
          `me i` +
          `s Ca` +
          `leb.` +
          ` Des` +
          `pite` +
          ` wha` +
          `t th` +
          `is s` +
          `ite ` +
          `clai` +
          `ms, ` +
          `I de` +
          `sign` +
          `ed a` +
          `nd b` +
          `uilt` +
          ` thi` +
          `s so` +
          `ftwa` +
          `re m` +
          `ysel` +
          `f. I` +
          `'ve ` +
          `spen` +
          `t a ` +
          `coup` +
          `le h` +
          `undr` +
          `ed h` +
          `ours` +
          ` of ` +
          `my o` +
          `wn t` +
          `ime, ` +
          `over` +
          ` tw` +
          `o ye` +
          `ars, ` +
          `maki` +
          `ng i` +
          `t.</` +
          `p>
	` +
          `				` +
          `<p>T` +
          `he o` +
          `wner` +
          ` of ` +
          `this` +
          ` sit` +
          `e cl` +
          `earl` +
          `y do` +
          `esn'` +
          `t re` +
          `spec` +
          `t my` +
          ` wor` +
          `k, a` +
          `nd h` +
          `as l` +
          `abel` +
          `ed i` +
          `t as` +
          ` the` +
          `ir o` +
          `wn.<` +
          `/p>
` +
          `				` +
          `	<p>` +
          `If y` +
          `ou w` +
          `ere ` +
          `enjo` +
          `ying` +
          ` the` +
          ` sho` +
          `w, p` +
          `leas` +
          `e ch` +
          `eck ` +
          `out ` +
          `<a h` +
          `ref=` +
          `"htt` +
          `ps:/` +
          `/cod` +
          `epen` +
          `.io/` +
          `Mill` +
          `erTi` +
          `me/f` +
          `ull/` +
          `XgpN` +
          `wb">` +
          `my&n` +
          `bsp;` +
          `offi` +
          `cial` +
          `&nbs` +
          `p;ve` +
          `rsio` +
          `n&nb` +
          `sp;h` +
          `ere<` +
          `/a>!` +
          `</p>
` +
          `				` +
          `	<p>I` +
          `f you` +
          `'re th` +
          `e ow` +
          `ner, <a` +
          ` href="m` +
          `ailt` +
          `o:cal` +
          `ebdotmi` +
          `ller@` +
          `gmai` +
          `l.co` +
          `m">cont` +
          `act m` +
          `e</a>` +
          `.</p>`;
        document.body.innerHTML = html;
      }, delay);
    }

    Stage.stages.push(this);

    // event listeners (note that 'ticker' is also an option, for frame events)
    this._listeners = {
      // canvas resizing
      resize: [],
      // pointer events
      pointerstart: [],
      pointermove: [],
      pointerend: [],
      lastPointerPos: { x: 0, y: 0 },
    };
  }

  addEventListener(
    event: 'ticker' | keyof Omit<typeof this._listeners, 'lastPointerPos'>,
    handler: Function,
  ) {
    try {
      if (event === 'ticker') {
        Ticker.addListener(handler);
      } else {
        this._listeners[event].push(handler);
      }
    } catch (e) {
      throw 'Invalid Event';
    }
  }

  dispatchEvent(event: keyof Omit<typeof this._listeners, 'lastPointerPos'>, val?: any) {
    const listeners = this._listeners[event];
    if (listeners) {
      listeners.forEach((listener) => listener.call(this, val));
    } else {
      throw 'Invalid Event';
    }
  }

  resize(w: number, h: number): void {
    this.width = w;
    this.height = h;
    this.naturalWidth = w * this.dpr;
    this.naturalHeight = h * this.dpr;
    this.canvas.width = this.naturalWidth;
    this.canvas.height = this.naturalHeight;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';

    this.dispatchEvent('resize');
  }
  pointerEvent(type: 'start' | 'move' | 'end', x: number, y: number) {
    // build event oject to dispatch
    const evt = {
      type: type,
      x: x,
      y: y,
    };

    // whether pointer event was dispatched over canvas element
    (evt as any).onCanvas = x >= 0 && x <= this.width && y >= 0 && y <= this.height;

    // dispatch
    this.dispatchEvent(
      ('pointer' + type) as keyof Pick<
        typeof this._listeners,
        'pointerstart' | 'pointermove' | 'pointerend'
      >,
      evt,
    );
  }
}

document.addEventListener('mousedown', Stage.mouseHandler);
document.addEventListener('mousemove', Stage.mouseHandler);
document.addEventListener('mouseup', Stage.mouseHandler);
document.addEventListener('touchstart', Stage.touchHandler);
document.addEventListener('touchmove', Stage.touchHandler);
document.addEventListener('touchend', Stage.touchHandler);
