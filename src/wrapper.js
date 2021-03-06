// This module is important for `esm` versioning support and should be
// changed as little as possible. Please ensure any changes are backwards
// compatible.

import GenericArray from "./generic/array.js"

import has from "./util/has.js"
import maskFunction from "./util/mask-function.js"
import maxSatisfying from "./util/max-satisfying.js"
import setSilent from "./util/set-silent.js"
import shared from "./shared.js"
import silent from "./util/silent.js"
import toExternalFunction from "./util/to-external-function.js"
import { version } from "./version.js"

function init() {
  const Wrapper = {
    __proto__: null,
    find(object, name, range) {
      const map = getMap(object, name)

      if (map) {
        const maxVersion = maxSatisfying(map.versions, range)

        if (maxVersion) {
          return map.wrappers[maxVersion]
        }
      }

      return null
    },
    manage(object, name, wrapper) {
      const value = Wrapper.unwrap(object, name)
      const manager = maskFunction(function (...args) {
        return Reflect.apply(wrapper, this, [manager, value, args])
      }, value)

      Reflect.defineProperty(manager, shared.symbol.wrapper, {
        __proto__: null,
        configurable: true,
        value,
        writable: true
      })

      setSilent(object, name, manager)
    },
    unwrap(object, name) {
      const manager = silent(() => object[name])
      const symbol = shared.symbol.wrapper
      return has(manager, symbol) ? manager[symbol]  : manager
    },
    wrap(object, name, wrapper) {
      const map = getOrCreateMap(object, name)

      if (typeof map.wrappers[version] !== "function") {
        GenericArray.push(map.versions, version)
        map.wrappers[version] = toExternalFunction(wrapper)
      }
    }
  }

  function createMap(object, name) {
    // Store the wrapper map as `object[shared.symbol.wrapper][name]` rather
    // than on the function, so that other code can modify the same property
    // without interfering with our wrapper.
    return getOrCreateStore(object)[name] = {
      __proto__: null,
      raw: Wrapper.unwrap(object, name),
      versions: [],
      wrappers: { __proto__: null }
    }
  }

  function createStore(object) {
    const value = { __proto__: null }

    Reflect.defineProperty(object, shared.symbol.wrapper, {
      __proto__: null,
      configurable: true,
      value,
      writable: true
    })

    return value
  }

  function getMap(object, name) {
    const store = getStore(object)

    if (store &&
        Reflect.has(store, name)) {
      return store[name]
    }

    return null
  }

  function getOrCreateMap(object, name) {
    return getMap(object, name) || createMap(object, name)
  }

  function getOrCreateStore(object) {
    return getStore(object) || createStore(object)
  }

  function getStore(object) {
    const symbol = shared.symbol.wrapper
    return has(object, symbol) ? object[symbol] : null
  }

  return Wrapper
}

export default shared.inited
  ? shared.module.Wrapper
  : shared.module.Wrapper = init()
