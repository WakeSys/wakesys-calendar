import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';

// Read version from package.json
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const version = pkg.version;

const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/wakesyscalendar.js',
  format: 'iife',
  globalName: 'WakeSysCalendarLib',
  platform: 'browser',
  target: ['es2020'],
  sourcemap: true,
  minify: !isWatch,
  banner: {
    js: `/**
 * WakeSys Calendar v${version}
 * Copyright (c) 2025 wakesys s.à.r.l.
 * Licensed under GPL-3.0
 * 
 * @version ${version}
 */`,
  },
  footer: {
    js: `
// Expose WakeSysCalendar globally for script tag usage
if (typeof window !== 'undefined') {
  window.WakeSysCalendar = WakeSysCalendarLib.WakeSysCalendar;
  window.initWakeSysCalendarLegacy = WakeSysCalendarLib.initWakeSysCalendarLegacy;
}`,
  },
};

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(buildOptions);
  console.log('Build complete!');
}

