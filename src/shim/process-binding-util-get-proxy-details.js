import OwnProxy from "../own/proxy.js"

import call from "../util/call.js"
import isOwnProxy from "../util/is-own-proxy.js"
import shared from "../shared.js"
import silent from "../util/silent.js"

function init() {
  const Shim = {
    __proto__: null,
    enable(context) {
      const cache = shared.memoize.shimProcessBindingUtilGetProxyDetails

      let _getProxyDetails
      let utilBinding

      silent(() => {
        try {
          utilBinding = context.process.binding("util")
          _getProxyDetails = utilBinding.getProxyDetails
        } catch (e) {}
      })

      if (check(utilBinding, _getProxyDetails, cache)) {
        return context
      }

      const getProxyDetails = (value) => {
        return isOwnProxy(value)
          ? void 0
          : call(_getProxyDetails, utilBinding, value)
      }

      try {
        utilBinding.getProxyDetails = new OwnProxy(_getProxyDetails, {
          apply(target, thisArg, args) {
            return getProxyDetails(args[0])
          }
        })

        cache.set(utilBinding, true)
      } catch (e) {}

      return context
    }
  }

  function check(utilBinding, getProxyDetails, cache) {
    if (! utilBinding ||
        typeof getProxyDetails !== "function") {
      return true
    }

    let result = cache.get(utilBinding)

    if (typeof result === "boolean") {
      return result
    }

    result = false

    try {
      const proxy = new OwnProxy(getProxyDetails)

      result = getProxyDetails(proxy) === void 0
    } catch (e) {}

    cache.set(utilBinding, result)
    return result
  }

  return Shim
}

export default shared.inited
  ? shared.module.shimProcessBindingUtilGetProxyDetails
  : shared.module.shimProcessBindingUtilGetProxyDetails = init()
