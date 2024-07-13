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

it('test for md Example', async () => {
  const store = new SpaceStoreInstance('user')
  // 设置数据
  await store.set('user', { name: 'John Doe', age: 30 })

  // 获取数据
  const userData = await store.get('user')
  expect(userData).toEqual({ name: 'John Doe', age: 30 })

  // 设置带有过期时间的数据
  await store.set('sessionToken', 'abc123', (1 / 24 / 60 / 60) * 2) // 2秒后过期

  await sleep(2.1)
  // 2秒后尝试获取数据
  const token = await store.getByStrict('sessionToken')
  expect(token).toEqual(undefined) // 输出: undefined，因为数据已过期

  // 设置多个键值对
  await store.store.set('user', {
    user_one: { name: 'Alice', age: 25 },
    user_two: { name: 'Bob', age: 30 },
  })

  // 使用正则表达式获取用户数据
  const allUserData = await store.findByReg(/^user_.*$/, 'entries')
  expect(allUserData).toMatchInlineSnapshot(`
      {
        "user_one": {
          "age": 25,
          "name": "Alice",
        },
        "user_two": {
          "age": 30,
          "name": "Bob",
        },
      }
    `)

  const allUserData2 = await store.findByReg('user_.*', 'entries')
  expect(allUserData2).toMatchInlineSnapshot(`
      {
        "user_one": {
          "age": 25,
          "name": "Alice",
        },
        "user_two": {
          "age": 30,
          "name": "Bob",
        },
      }
    `)
  expect(allUserData).toEqual(allUserData2)

  const UserOneData = await store.findByReg('.*_one', 'entries')
  expect(UserOneData).toMatchInlineSnapshot(`
      {
        "user_one": {
          "age": 25,
          "name": "Alice",
        },
      }
    `)

  // 清理所有过期数据
  await store.cleanAllExpireData()

  // 清理所有数据
  await store.removeAll()
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
