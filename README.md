# scope-store

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![License][license-src]][license-href]

Based on IndexDB, driven by Dexie, providing kv storage capability with namespace

## install

```shell
npm install scope-store dexie
```

## Example

```js
import { SpaceStoreInstance } from 'scope-store'

it('set & get', async () => {
  const userStore = new SpaceStoreInstance('user')
  await userStore.set('name', '张三')
  const name = await userStore.get('name')
  expect(name).toEqual('张三')
})
```

## More
[Test Example](test/index.test.ts)

## License

[MIT](./LICENSE) License © 2024-PRESENT [XiaDeYu](https://github.com/Xdy1579883916)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/scope-store?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/scope-store
[npm-downloads-src]: https://img.shields.io/npm/dm/scope-store?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/scope-store
[bundle-src]: https://img.shields.io/bundlephobia/minzip/scope-store?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=scope-store
[license-src]: https://img.shields.io/github/license/Xdy1579883916/scope-store.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/Xdy1579883916/scope-store/blob/main/LICENSE
