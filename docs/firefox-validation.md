# Firefox integration validation

Local validation on 2026-10-26 used Node 22.23.2, macOS arm64, OpenPolyfill 0.3.0,
Playwright 1.64.1 and its Firefox 157.0. All browser runs were headless.

| Check | Result |
| --- | --- |
| Vitest 4.0.18 | 6 files, 17 passed, 0 failed, 0 skipped |
| Vitest 3.2.7 | 6 files, 17 passed, 0 failed, 0 skipped |
| TypeScript | Passed with both Vitest versions |
| ESLint | Passed |
| Build and publint | Passed |

The first Firefox integration test failed before implementing the Firefox
launcher. Further RED→GREEN checks exposed rejection of unsupported Firefox
profile options and `import.meta.resolve()` being unavailable when launching
through a real custom Vitest environment. Preparation now resolves the harness
through Node's package resolver instead of the transformed module runner.

Real-browser checks cover background evaluation and argument serialization,
popup URLs, temporary installation without a background, close/relaunch,
recovery after installation failure, a retained background handle after
`runtime.reload()`, and Chromium background/popup lifecycle support. The custom
environment is exercised by Vitest itself, not only by calling `setup()` directly.
A further deterministic transport regression test covers a replacement actor
arriving during the parent-process URL lookup. It failed with the listener
registered after lookup, and passed when registration moved before lookup; close
also removes that listener. This adds one test to the 17-test baseline above.
No in-flight evaluation is automatically replayed after actor replacement.

Both Vitest versions are also checked in CI. Publication and consumer migration
are separate steps; this change does not publish a package or merge either PR.
