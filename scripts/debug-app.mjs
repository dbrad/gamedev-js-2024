import * as esbuild from 'esbuild';
import SpglslPlugin from 'esbuild-plugin-spglsl';
import http from 'node:http';
import { DEFINITIONS } from './constants.mjs';

let ctx = await esbuild.context({
  entryPoints: ["src/ts/app.ts"],
  bundle: true,
  format: 'iife',
  // sourcemap: true,
  outfile: "build/debug/app.js",
  define: {
    "DEBUG": 'true',
    ...DEFINITIONS
  },
  loader: {
    ".webp": "dataurl"
  },
  plugins: [
    SpglslPlugin({
      compileMode: 'Optimize',
      minify: true
    }),
  ]
});

let { host, port } = await ctx.serve({
  servedir: "build/debug",
  host: "localhost"
});

http.createServer((req, res) =>
{
  const options = {
    hostname: host,
    port: port,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, proxyRes =>
  {
    if (proxyRes.statusCode === 404)
    {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>Not Found</h1>');
      return;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });
}).listen(3000);

console.log(`Serving running on http://localhost:3000`);