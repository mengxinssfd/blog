<template>
  <div class="c-firework">
    <!-- SVG Spritesheet -->
    <div style="height: 0; width: 0; position: absolute; visibility: hidden">
      <svg xmlns="http://www.w3.org/2000/svg">
        <symbol id="icon-play" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </symbol>
        <symbol id="icon-pause" viewBox="0 0 24 24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </symbol>
        <symbol id="icon-close" viewBox="0 0 24 24">
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </symbol>
        <symbol id="icon-settings" viewBox="0 0 24 24">
          <path
            d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
        </symbol>
        <symbol id="icon-sound-on" viewBox="0 0 24 24">
          <path
            d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </symbol>
        <symbol id="icon-sound-off" viewBox="0 0 24 24">
          <path
            d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
        </symbol>
      </svg>
    </div>

    <!-- App -->
    <div class="container">
      <div v-show="false" class="loading-init">
        <div class="loading-init__header">Loading</div>
        <div class="loading-init__status">Assembling Shells</div>
      </div>
      <div class="stage-container remove">
        <div class="canvas-container">
          <canvas id="trails-canvas"></canvas>
          <canvas id="main-canvas"></canvas>
        </div>
        <div v-show="false" class="controls">
          <div class="btn pause-btn">
            <svg fill="white" width="24" height="24">
              <use href="#icon-pause" xlink:href="#icon-pause"></use>
            </svg>
          </div>
          <div class="btn sound-btn">
            <svg fill="white" width="24" height="24">
              <use href="#icon-sound-off" xlink:href="#icon-sound-off"></use>
            </svg>
          </div>
          <div class="btn settings-btn">
            <svg fill="white" width="24" height="24">
              <use href="#icon-settings" xlink:href="#icon-settings"></use>
            </svg>
          </div>
        </div>
        <div class="menu hide">
          <div class="menu__inner-wrap">
            <div class="btn btn--bright close-menu-btn">
              <svg fill="white" width="24" height="24">
                <use href="#icon-close" xlink:href="#icon-close"></use>
              </svg>
            </div>
            <div class="menu__header">Settings</div>
            <div class="menu__subheader">For more info, click any label.</div>
            <form>
              <div class="form-option form-option--select">
                <label class="shell-type-label">Shell Type</label>
                <select class="shell-type"></select>
              </div>
              <div class="form-option form-option--select">
                <label class="shell-size-label">Shell Size</label>
                <select class="shell-size"></select>
              </div>
              <div class="form-option form-option--select">
                <label class="quality-ui-label">Quality</label>
                <select class="quality-ui"></select>
              </div>
              <div class="form-option form-option--select">
                <label class="sky-lighting-label">Sky Lighting</label>
                <select class="sky-lighting"></select>
              </div>
              <div class="form-option form-option--select">
                <label class="scaleFactor-label">Scale</label>
                <select class="scaleFactor"></select>
              </div>
              <div class="form-option form-option--checkbox">
                <label class="auto-launch-label">Auto Fire</label>
                <input class="auto-launch" type="checkbox" />
              </div>
              <div class="form-option form-option--checkbox form-option--finale-mode">
                <label class="finale-mode-label">Finale Mode</label>
                <input class="finale-mode" type="checkbox" />
              </div>
              <div class="form-option form-option--checkbox">
                <label class="hide-controls-label">Hide Controls</label>
                <input class="hide-controls" type="checkbox" />
              </div>
              <div class="form-option form-option--checkbox form-option--fullscreen">
                <label class="fullscreen-label">Fullscreen</label>
                <input class="fullscreen" type="checkbox" />
              </div>
              <div class="form-option form-option--checkbox">
                <label class="long-exposure-label">Open Shutter</label>
                <input class="long-exposure" type="checkbox" />
              </div>
            </form>
            <div class="credits">
              Passionately built by
              <a href="https://cmiller.tech/" target="_blank">Caleb Miller</a>.
            </div>
          </div>
        </div>
      </div>
      <div class="help-modal">
        <div class="help-modal__overlay"></div>
        <div class="help-modal__dialog">
          <div class="help-modal__header"></div>
          <div class="help-modal__body"></div>
          <button type="button" class="help-modal__close-btn">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  setup() {
    if (!process.client) return {};
    onMounted(() => {
      import('./fw');
    });
    return {};
  },
});
</script>
<style lang="scss">
.c-firework {
  pointer-events: none;
  background: rgba(0, 0, 0, 0.2);

  position: fixed;
  z-index: 1000000;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  $small-bp: 640px;
  $large-bp: 840px;

  $ui-opacity: 0.5;
  $ui-color: rgba(#fff, $ui-opacity);
  $font: 'Russo One', arial, sans-serif;
  $letter-spacing: 0.06em;

  // Utils
  // -------

  .hide {
    opacity: 0;
    visibility: hidden;
  }

  .remove {
    display: none !important;
  }

  .blur {
    filter: blur(12px);
  }

  .container {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .loading-init {
    width: 100%;
    align-self: center;
    text-align: center;
    text-transform: uppercase;

    &__header {
      font-size: 2.2em;
    }

    &__status {
      margin-top: 1em;
      font-size: 0.8em;
      opacity: 0.75;
    }
  }

  .stage-container {
    // Keep menu blur contained
    overflow: hidden;
    // Let border width add to size
    box-sizing: initial;
    border: 1px solid #222;
    // Allow border to be hidden when fullscreen
    margin: -1px;

    // no need for border on small screens, especially since it causes horizontal scrolling on iOS.
    @media (max-width: $large-bp) {
      border: none;
      margin: 0;
    }
  }

  .canvas-container {
    pointer-events: none;
    width: 100%;
    height: 100%;
    transition: filter 0.3s;

    canvas {
      position: absolute;
      // Use lighten blend mode so the sky can be shown lighting up behind the canvases.
      mix-blend-mode: lighten;
      // Chrome mobile always places <canvas> elements on their own composite layer, but Chrome
      // on desktop doesn't, so we'll force it. Compositing makes sense since the canvas elements,
      // but not all UI, redraws each frame.
      transform: translateZ(0);
    }
  }

  .controls {
    position: absolute;
    top: 0;
    width: 100%;
    padding-bottom: 50px;
    display: flex;
    justify-content: space-between;
    transition: opacity 0.3s, visibility 0.3s;

    @media (min-width: $large-bp) {
      visibility: visible;

      &.hide:hover {
        opacity: 1;
      }
    }
  }

  .menu {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.42);
    transition: opacity 0.3s, visibility 0.3s;
    pointer-events: auto;

    &__inner-wrap {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      transition: opacity 0.3s;
    }

    &__header {
      margin-top: auto;
      margin-bottom: 8px;
      padding-top: 16px;
      font-size: 2em;
      text-transform: uppercase;
    }

    &__subheader {
      margin-bottom: auto;
      padding-bottom: 12px;
      font-size: 0.86em;
      opacity: 0.8;
    }

    form {
      width: 100%;
      max-width: 400px;
      padding: 0 10px;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }

    .form-option {
      display: flex;
      align-items: center;
      margin: 16px 0;
      transition: opacity 0.3s;

      label {
        display: block;
        width: 50%;
        padding-right: 12px;
        text-align: right;
        text-transform: uppercase;
        user-select: none;
      }

      &--select {
        select {
          display: block;
          width: 50%;
          height: 30px;
          font-size: 1rem;
          font-family: $font;
          color: $ui-color;
          letter-spacing: $letter-spacing;
          background-color: transparent;
          border: 1px solid $ui-color;

          option {
            background-color: black;
          }
        }
      }

      &--checkbox {
        input {
          display: block;
          width: 26px;
          height: 26px;
          margin: 0;
          opacity: $ui-opacity;
        }
      }

      @media (max-width: $large-bp) {
        select,
        input {
          outline: none;
        }
      }
    }
  }

  .close-menu-btn {
    position: absolute;
    top: 0;
    right: 0;
  }

  .btn {
    $size: 50px;
    opacity: 0.16;
    width: $size;
    height: $size;
    display: flex;
    user-select: none;
    cursor: default;
    transition: opacity 0.3s;

    &--bright {
      opacity: 0.5;
    }

    @media (min-width: $large-bp) {
      &:hover {
        opacity: 0.32;
      }

      &--bright:hover {
        opacity: 0.75;
      }
    }

    svg {
      display: block;
      margin: auto;
    }
  }

  .credits {
    margin-top: auto;
    margin-bottom: 10px;
    padding-top: 6px;
    font-size: 0.8em;
    opacity: 0.75;

    a {
      color: $ui-color;
      text-decoration: none;

      &:hover,
      &:active {
        color: rgba(white, 0.75);
        text-decoration: underline;
      }
    }
  }

  .help-modal {
    $self: &;
    $duration-in: 0.4s;
    $duration-out: 0.25s;
    $curve-in: ease-out;
    $curve-out: ease-in;

    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    visibility: hidden;
    transition-property: visibility;
    transition-duration: $duration-out;

    &__overlay {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      opacity: 0;
      transition-property: opacity;
      transition-timing-function: $curve-out;
      transition-duration: $duration-out;
    }

    &__dialog {
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 400px;
      max-height: calc(100vh - 100px);
      margin: 10px;
      padding: 20px;
      border-radius: 0.3em;
      background-color: rgba(#000, 0.4);
      opacity: 0;
      transform: scale(0.9, 0.9);
      transition-property: opacity, transform;
      transition-timing-function: $curve-out;
      transition-duration: $duration-out;

      @media (min-width: $large-bp) {
        font-size: 1.25rem;
        max-width: 500px;
      }
    }

    &__header {
      font-size: 1.75em;
      text-transform: uppercase;
      text-align: center;
    }

    &__body {
      $separator-color: rgba(#fff, 0.25);

      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      margin: 1em 0;
      padding: 1em 0;
      border-top: 1px solid $separator-color;
      border-bottom: 1px solid $separator-color;
      line-height: 1.5;
      color: rgba(#fff, 0.75);
    }

    // These styles can be adopted as a standard button style if needed.
    &__close-btn {
      flex-shrink: 0;
      outline: none;
      border: none;
      border-radius: 2px;
      padding: 0.25em 0.75em;
      margin-top: 0.36em;
      font-family: $font;
      font-size: 1em;
      color: $ui-color;
      text-transform: uppercase;
      letter-spacing: $letter-spacing;
      background-color: rgba(#fff, 0.25);
      transition: color 0.3s, background-color 0.3s;

      &:hover,
      &:active,
      &:focus {
        color: #fff;
        background-color: #09f;
      }
    }

    &.active {
      visibility: visible;
      transition-duration: $duration-in;

      #{$self}__overlay {
        opacity: 1;
        transition-timing-function: $curve-in;
        transition-duration: $duration-in;
      }

      #{$self}__dialog {
        opacity: 1;
        transform: scale(1, 1);
        transition-timing-function: $curve-in;
        transition-duration: $duration-in;
      }
    }
  }
}
</style>
