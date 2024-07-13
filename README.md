# SpaceStore

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![License][license-src]][license-href]

## Introduction
#### A JavaScript storage utility library based on Dexie, which provides a simple and easy-to-use API for managing and manipulating local storage data. This library is highly suitable for scenarios that require data storage and retrieval in the browser or Node.js environment.
#### 基于 Dexie 的 JavaScript 存储工具库，它提供了一套简单易用的 API 来管理和操作本地存储数据。该库非常适合需要在浏览器或 Node.js 环境中进行数据存储和检索的场景。

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

## API 文档

### 构造函数

- `constructor(namespace?: string)`: 创建一个新的存储实例。`namespace` 是可选的，默认为 `'default'`。

### 实例方法

- `async _get(keys?: string | string[] | { [key: string]: any } | null)`: 获取指定键或键数组的值。

- `async keys()`: 获取当前命名空间下的所有键。

- `async set(key: string, value: any, expireDate?: number)`: 设置一个键值对，可选地设置过期时间。

- `async setByKeyArr(keyArr: string[], value: any, opt: TSetByKeyArrOpt = {})`: 根据键数组设置值，可以指定连接符、是否过滤无效值和过期时间。

- `async get(key?: string)`: 获取指定键的值，如果未指定键，则获取所有键的值。

- `async getByStrict(key?: string)`: 严格模式下获取键的值，如果键已过期则自动删除并返回 `undefined`。

- `async findByReg(pattern: RegExp | string, mode: 'keys' | 'values' | 'entries' | 'one' = 'keys')`: 根据正则表达式查找键或值。

- `async remove(key: string)`: 移除指定键的值。

- `async removeByKeys(keys: string[])`: 根据键数组批量移除值。

- `async removeAll()`: 清除当前命名空间下的所有数据。

- `async removeByReg(pattern: RegExp | string)`: 根据正则表达式移除键值对。

- `async cleanAllExpireData()`: 清除所有过期的数据。

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
