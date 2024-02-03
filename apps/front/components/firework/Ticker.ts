export const Ticker = (function TickerFactory(window) {
  'use strict';

  // public
  // will call function reference repeatedly once registered, passing elapsed time and a lag multiplier as parameters
  const Ticker = {
    addListener(callback: Function) {
      if (typeof callback !== 'function')
        // eslint-disable-next-line no-throw-literal
        throw 'Ticker.addListener() requires a function reference passed for a callback.';

      listeners.push(callback);

      // start frame-loop lazily
      if (!started) {
        started = true;
        queueFrame();
      }
    },
  };

  // private
  let started = false;
  let lastTimestamp = 0;
  const listeners: Function[] = [];

  // queue up a new frame (calls frameHandler)
  function queueFrame() {
    if (typeof window.requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(frameHandler);
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      webkitRequestAnimationFrame(frameHandler);
    }
  }

  function frameHandler(timestamp: number): void {
    let frameTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    // make sure negative time isn't reported (first frame can be whacky)
    if (frameTime < 0) {
      frameTime = 17;
    }
    // - cap minimum framerate to 15fps[~68ms] (assuming 60fps[~17ms] as 'normal')
    else if (frameTime > 68) {
      frameTime = 68;
    }

    // fire custom listeners
    listeners.forEach((listener) => listener.call(window, frameTime, frameTime / 16.6667));

    // always queue another frame
    queueFrame();
  }

  return Ticker;
})(window);
