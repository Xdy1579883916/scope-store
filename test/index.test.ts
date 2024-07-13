import { describe, expect, it } from 'vitest'
import 'fake-indexeddb/auto'
import { SpaceStoreInstance } from '../src'

function sleep(time: number) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      // eslint-disable-next-line ts/no-unused-expressions
      timer && clearTimeout(timer)
      resolve(null)
    }, time * 1000)
  })
}

describe('should', () => {
  it('set & get', async () => {
    const userStore = new SpaceStoreInstance('user')
    await userStore.set('name', '张三')
    const name = await userStore.get('name')
    expect(name).toEqual('张三')
  })

  const store = new SpaceStoreInstance('hi')

  async function initData() {
    await store.set('data1', 'data1')
    await store.set('abc', '123')
  }

  it('初始化', async () => {
    await store.removeAll()
    await initData()
    expect((await store.keys()).length).toEqual(2)
  })
  it('设置值, 获取值', async () => {
    await store.set('name', '张三')
    expect(await store.getByStrict('name')).toEqual('张三')
  })
  it('设置可过期的值, 获取值', async () => {
    // 设置值2秒后过期
    await store.set('name2', '张三', (1 / 24 / 60 / 60) * 2)
    // 此时获取应该没有过期
    await sleep(1)
    expect(await store.getByStrict('name2')).toEqual('张三')

    // 此时应该过期了
    await sleep(1.1)
    expect(await store.getByStrict('name2')).toEqual(undefined)
  })
  it('删除多个key', async () => {
    await store.removeByKeys(['abc', 'data1', 'name'])
    expect((await store.keys()).length).toEqual(0)
  })
  it('设置可过期的值, 并删除', async () => {
    await store.set('data1', 'data1', 1)
    await store.set('data2', 'data2', 1)
    await store.set('data3', 'data3', 1)
    expect((await store.keys()).length).toEqual(6)
    await sleep(2)
    await store.getByStrict('')
    expect((await store.keys()).length).toEqual(6)
    await store.removeByKeys(['data1', 'data2', 'data3'])
    expect((await store.keys()).length).toEqual(0)
  })
  it('设置正则表达式获取数据', async () => {
    await store.set('key1', 'data1')
    await store.set('key2', 'data2')
    await store.set('key3', 'data3')
    const keys = await store.findByReg(/key.*/, 'keys')
    expect(Object.prototype.toString.call(keys)).toBe('[object Array]')
    expect(keys.length).toEqual(3)
    const keys2 = await store.findByReg(/key.*/, 'keys')
    expect(keys2.length).toEqual(3)
    expect(keys2).toEqual(keys)

    const values = await store.findByReg(/key.*/, 'values')
    const values2 = await store.findByReg('key.*', 'values')
    expect(Object.prototype.toString.call(values)).toBe('[object Array]')
    expect(values.length).toEqual(3)
    expect(values).includes('data1')
    expect(values).includes('data2')
    expect(values).includes('data3')
    expect(values2).toEqual(values)

    const entries = await store.findByReg(/key.*/, 'entries')
    expect(entries).toBeTypeOf('object')
    expect(Object.prototype.toString.call(entries)).toBe('[object Object]')
    expect(entries).haveOwnProperty('key1')
    expect(entries).haveOwnProperty('key2')
    expect(entries).haveOwnProperty('key3')

    await store.removeByKeys(keys)
    expect((await store.keys()).length).toEqual(0)
  })
  it('设置可过期的值, 获取值 2.0', async () => {
    // 设置值2秒后过期
    await store.set('name1', '张三1', (1 / 24 / 60 / 60) * 2)
    await store.set('name2', '张三2', (1 / 24 / 60 / 60) * 2)
    // 此时获取应该没有过期
    await sleep(1)
    expect(await store.getByStrict('name1')).toEqual('张三1')
    expect(await store.getByStrict('name2')).toEqual('张三2')

    await sleep(1.1)
    // 此时1、2应该都过期了, 所有过期的值都被清理
    // getByStrict 会自动删除过期值
    expect(await store.getByStrict('name1')).toEqual(undefined)
    // get 可以获取过期的值, 可以调用cleanAllExpireData主动清理所有过期值
    await store.cleanAllExpireData()
    expect(await store.get('name2')).toEqual(undefined)
    expect(Object.entries(await store._get()).length).toEqual(0)
  })
  it('undefined value', async () => {
    await store.set('undefined', undefined)
    expect(await store.get('undefined')).toEqual(undefined)
  })
  it('false value', async () => {
    // 0 false or ''
    await store.set('value-false', false)
    expect(await store.get('value-false')).toEqual(false)

    await store.set('value-0', 0)
    expect(await store.get('value-0')).toEqual(0)

    await store.set('value', '')
    expect(await store.get('value')).toEqual('')
  })
})
