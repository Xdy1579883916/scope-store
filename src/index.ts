import Dexie from 'dexie'

function check(data: any, type: string) {
  return Object.prototype.toString.call(data) === `[object ${type}]`
}

function parseToReg(pattern: string | RegExp) {
  return new RegExp(pattern)
}

function joinToStr(arr: any, joinStr: string = '_', filter: boolean = true) {
  if (!Array.isArray(arr)) {
    return JSON.stringify(arr) || ''
  }
  if (filter) {
    arr = arr.filter(Boolean)
  }
  return arr.join(joinStr)
}

interface StorageItem {
  namespace: string
  key: string
  value: any
}

interface TSetByKeyArrOpt {
  expired?: number
  joinStr?: string
  filter?: boolean
}

class SpaceStore extends Dexie {
  private data: Dexie.Table<StorageItem, [string, string]>

  constructor() {
    super('SpaceStore')
    this.version(1).stores({
      data: '[namespace+key], namespace, key',
    })
    this.data = this.table('data')
  }

  async getAll(namespace: string): Promise<{ [key: string]: any } | null> {
    if (!namespace) {
      return null
    }
    const items = await this.data.where('namespace').equals(namespace).toArray()
    return items.reduce((acc, cur) => {
      acc[cur.key] = cur.value
      return acc
    }, {})
  }

  async get(namespace: string, keys?: string | string[] | { [key: string]: any } | null): Promise<{
    [key: string]: any
  } | null> {
    if (!keys) {
      return this.getAll(namespace)
    }

    if (check(keys, 'String')) {
      keys = [keys]
    }

    if (check(keys, 'Object')) {
      keys = Object.keys(keys)
    }

    if (Array.isArray(keys)) {
      const items = await this.data.where('[namespace+key]').anyOf(keys.map(key => [namespace, key])).toArray()
      return items.reduce((result, item) => {
        result[item.key] = item.value
        return result
      }, {})
    }

    return null
  }

  async set(namespace: string, items: { [key: string]: any }): Promise<void> {
    const dataToPut = Object.keys(items).map(key => ({ namespace, key, value: items[key] }))
    await this.data.bulkPut(dataToPut)
  }

  async remove(namespace: string, keys: string | string[]): Promise<void> {
    if (typeof keys === 'string') {
      keys = [keys]
    }
    await this.data.bulkDelete(keys.map(key => [namespace, key]))
  }

  async clear(namespace: string): Promise<void> {
    await this.data.where('namespace').equals(namespace).delete()
  }

  async keys(namespace: string): Promise<string[]> {
    // eslint-disable-next-line unused-imports/no-unused-vars
    return (await this.data.where('namespace').equals(namespace).primaryKeys()).map(([namespace, key]) => key)
  }

  async length(namespace: string): Promise<number> {
    return this.data.where('namespace').equals(namespace).count()
  }
}

export class SpaceStoreInstance {
  store: SpaceStore
  readonly namespace: string

  constructor(namespace?: string) {
    this.namespace = namespace || 'default'
    this.store = new SpaceStore()
  }

  async _get(keys?: string | string[] | { [key: string]: any } | null): Promise<any> {
    return this.store.get(this.namespace, keys || null)
  }

  async keys(): Promise<string[]> {
    return this.store.keys(this.namespace)
  }

  async set(key: string, value: any, expireDate?: number): Promise<void> {
    const data: { [key: string]: any } = { [key]: value }
    if (expireDate) {
      data[`${key}_expire`] = Date.now() + expireDate * 864e5
    }
    return this.store.set(this.namespace, data)
  }

  async setByKeyArr(keyArr: string[], value: any, opt: TSetByKeyArrOpt = {}): Promise<void> {
    const { expired, joinStr = '_', filter } = opt
    return this.set(joinToStr(keyArr, joinStr, filter), value, expired)
  }

  async get(key?: string): Promise<any> {
    if (!key) {
      return this._get()
    }
    const item = await this._get([key, `${key}_expire`])
    return item[key]
  }

  async getByStrict(key?: string): Promise<any> {
    if (!key) {
      await this.cleanAllExpireData()
      return this._get()
    }

    const item = await this._get([key, `${key}_expire`])
    const expireDate = item[`${key}_expire`]
    if (expireDate && Date.now() >= Number(expireDate)) {
      await this.remove(key)
      return undefined
    }
    return item[key]
  }

  async findByReg(pattern: RegExp | string, mode: 'keys' | 'values' | 'entries' | 'one' = 'keys'): Promise<any> {
    const data = await this._get()
    const new_pattern = parseToReg(pattern)
    const keys = Object.keys(data).filter(key => new_pattern.test(key))

    switch (mode) {
      case 'values':
        return keys.map(key => data[key])
      case 'entries':
        return keys.reduce((acc, key) => ({ ...acc, [key]: data[key] }), {})
      case 'one': {
        const key = keys[0]
        return key ? data[key] : null
      }
      default:
        return keys
    }
  }

  async remove(key: string): Promise<void> {
    return this.store.remove(this.namespace, [key, `${key}_expire`])
  }

  async removeByKeys(keys: string[]): Promise<void> {
    if (!keys.length)
      return Promise.resolve()
    const newKeys = keys.flatMap(key => [key, `${key}_expire`])
    return this.store.remove(this.namespace, newKeys)
  }

  async removeAll(): Promise<void> {
    return this.store.clear(this.namespace)
  }

  async removeByReg(pattern: RegExp | string): Promise<void> {
    const keys: string[] = await this.findByReg(pattern)
    await this.removeByKeys(keys)
  }

  async cleanAllExpireData(): Promise<void> {
    const expiredObject = await this.findByReg(/.*_expire/, 'entries')
    const needRemoveKeys = Object.entries(expiredObject)
      .filter(([, expired]) => Date.now() >= Number(expired))
      .map(([k]) => k.replace('_expire', ''))

    await this.removeByKeys(needRemoveKeys)
  }
}
