# lint-time

![banner](banner.svg)

![npm](https://img.shields.io/npm/v/lint-time)
![npm type definitions](https://img.shields.io/npm/types/lint-time)
![license](https://img.shields.io/npm/l/lint-time)
[![install size](https://packagephobia.com/badge?p=lint-time)](https://packagephobia.com/result?p=lint-time)

**`lint-time`** will run your linters of your choice against the files of your choice (like
`lint-staged`). It only checks staged files - i.e. files that have changed since the previous
commit.

It aims to achieve **_the same goal with a far smaller footprint_**.

When used with [`simple-git-hooks`](https://github.com/toplenboren/simple-git-hooks) or
[`husky`](https://github.com/typicode/husky), it can lint your commits and block bad commits.

## Background

**Why not just use `lint-staged` instead?**

|                                      `lint-time` |                                      `lint-staged` |
| -----------------------------------------------: | -------------------------------------------------: |
|                                           0 deps |                                     60 nested deps |
| ![](https://packagephobia.com/badge?p=lint-time) | ![](https://packagephobia.com/badge?p=lint-staged) |

## Install

This package is available from the `npm` registry.

```sh
npm install lint-time
```

## Usage

```sh
npx lint-time
```

## API

Exports a single function:

```ts
export declare const lintTime: () => Promise<boolean>;
```

`lintTime()` will not throw if the checks fail, but will throw if there's something unexpected with
your system (e.g. a malformed `package.json`).

```ts
import { lintTime } from "lint-time";

lintTime().then((wasSuccessful) => {
  console.log({ wasSuccessful });
});
```

Supports JavaScript + TypeScript.

Can also be imported via `require("lint-time")`.

## Contributing

GitHub issues / PRs welcome.

Dev environment requires:

- node >= 16.14.0
- npm >= 6.8.0
- git >= 2.11

## Licence

Apache-2.0
