import { debug } from '@debug';
import { floor, min } from 'math';

let stage: HTMLDivElement;
let canvas: HTMLCanvasElement;

function scale(): void
{
  const scaleX: number = window.innerWidth / canvas.width;
  const scaleY: number = window.innerHeight / canvas.height;
  let scaleToFit: number = floor(min(scaleX, scaleY));
  scaleToFit = scaleToFit < 1 ? 1 : scaleToFit;
  const rule: string = "scale(" + scaleToFit + ")";
  stage.style.transform = rule;
};

export function init_canvas(): HTMLCanvasElement
{
  document.title = "Game";
  document.body.style.cssText = "margin:0;padding:0;background-color:#000;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;";
  stage = document.createElement("div");
  stage.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;max-height:100vh;max-width:100vw;";
  document.body.appendChild(stage);
  canvas = document.createElement("canvas");
  canvas.style.cssText = "image-rendering:pixelated;";
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;
  stage.appendChild(canvas);

  window.addEventListener("resize", scale);
  scale();

  return canvas;
};

export function request_fullscreen(canvas: HTMLCanvasElement): void
{
  if (document.fullscreenEnabled)
  {
    if (!document.fullscreenElement)
    {
      let body = document.querySelector("body");
      let fullscreen = canvas.requestFullscreen || canvas.mozRequestFullScreen || canvas.webkitRequestFullscreen || canvas.msRequestFullscreen;
      debug.assert(fullscreen !== undefined, "Unable to find a requestFullscreen implementation.");
      fullscreen.call(body);
    }
    else
    {
      document.exitFullscreen().then(scale);
    }
  }
};