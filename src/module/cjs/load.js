// Based on Node's `Module._load`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js

import ENTRY from "../../constant/entry.js"
import PACKAGE from "../../constant/package.js"

import Entry from "../../entry.js"

import _load from "./_load.js"
import builtinEntries from "../../builtin-entries.js"
import errors from "../../errors.js"
import isMJS from "../../util/is-mjs.js"

const {
  TYPE_ESM
} = ENTRY

const {
  OPTIONS_MODE_STRICT
} = PACKAGE

const {
  ERR_REQUIRE_ESM
} = errors

function load(request, parent, isMain) {
  if (Reflect.has(builtinEntries, request)) {
    return builtinEntries[request].module.exports
  }

  const childEntry = _load(request, parent, isMain)
  const child = childEntry.module

  if (parent &&
      childEntry.type === TYPE_ESM) {
    const { options } = Entry.get(parent).package

    if (options.mode === OPTIONS_MODE_STRICT &&
        (! options.cjs.vars ||
         isMJS(parent))) {
      throw new ERR_REQUIRE_ESM(child)
    }
  }

  return child.exports
}

export default load
