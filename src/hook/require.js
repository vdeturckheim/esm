import builtinEntries from "../builtin-entries.js"
import errors from "../errors.js"
import loadESM from "../module/esm/load.js"
import makeRequireFunction from "../module/make-require-function.js"
import moduleState from "../module/state.js"
import resolveFilename from "../module/esm/resolve-filename.js"

const {
  ERR_INVALID_ARG_TYPE,
  ERR_INVALID_ARG_VALUE
} = errors

function hook(parent) {
  function requirer(request) {
    if (typeof request !== "string") {
      throw new ERR_INVALID_ARG_TYPE("request", "string", request)
    }

    if (request === "") {
      throw new ERR_INVALID_ARG_VALUE("request",  request, "must be a non-empty string")
    }

    return Reflect.has(builtinEntries, request)
      ? builtinEntries[request].module.exports
      : loadESM(request, parent, false).module.exports
  }

  function resolver(request, options) {
    return resolveFilename(request, parent, false, options)
  }

  const req = makeRequireFunction(parent, requirer, resolver)

  req.main = moduleState.mainModule
  return req
}

export default hook
