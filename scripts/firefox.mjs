#!/usr/bin/env node
import process from 'node:process'
import { installFirefox, prepareFirefox } from '../dist/firefox.mjs'

const [command, ...args] = process.argv.slice(2)
if (command === 'install')
  installFirefox(args)
else if (command !== 'prepare')
  throw new Error('Usage: web-ext-firefox install [--with-deps] | prepare')
await prepareFirefox()
