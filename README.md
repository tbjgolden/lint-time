# lint-time

![banner](banner.svg)

![npm](https://img.shields.io/npm/v/lint-time)
![coverage](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Ftbjgolden%2Flint-time%2Fmain%2Fcoverage.json&label=coverage&query=$.total.lines.pct&color=brightgreen&suffix=%25)
![npm type definitions](https://img.shields.io/npm/types/lint-time)
![license](https://img.shields.io/npm/l/lint-time)
[![install size](https://packagephobia.com/badge?p=lint-time)](https://packagephobia.com/result?p=lint-time)

**`lint-time`** will run your linters of your choice against the files of your choice (like
`lint-staged`). It only checks staged files - i.e. files that have changed since the previous
commit.

It aims to achieve **_the same goal with a far smaller footprint_**.

When used with [`simple-git-hooks`](https://github.com/toplenboren/simple-git-hooks), it can lint
your commits and block bad commits.

## Background

**Why not just use `husky` + `lint-staged` instead?**

|                                                  `lint-time` |                                                  `lint-staged` |
| -----------------------------------------------------------: | -------------------------------------------------------------: |
|                                                       0 deps |                                                 60 nested deps |
| ![install size](https://packagephobia.com/badge?p=lint-time) | ![install size](https://packagephobia.com/badge?p=lint-staged) |

## Install

This package is available from the `npm` registry.

```sh
npm install lint-time
```

## Usage

```sh
npx lint-time ...
```

Supports JavaScript + TypeScript:

```ts
import { foo } from "lint-time";

foo();
```

Can also be imported via `require("lint-time")`.

## API

...

## Credits

...

## Contributing

- State where users can ask questions.
- State whether PRs are accepted.
- List any requirements for contributing; for instance, having a sign-off on commits.

Dev environment requires:

- node >= 16.14.0
- npm >= 6.8.0
- git >= 2.11

## Licence

Apache-2.0
