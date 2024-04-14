declare interface HTMLElement
{
  mozRequestFullScreen(): void;
  webkitRequestFullscreen(): void;
  msRequestFullscreen(): void;
}

declare interface Window
{
  app: number;
}

declare module '*.txt' {
  let content: string;
  export default content;
}

declare module '*.webp' {
  let content: string;
  export default content;
}

declare module '*.vert' {
  let content: string;
  export default content;
}

declare module '*.frag' {
  let content: string;
  export default content;
}