import assert from "assert"

describe("require hook", () => {
  it("should be detectable", () =>
    import("./require-hook/detectable.mjs")
      .then((ns) => ns.default())
  )

  it("should create an ESM loader", () =>
    import("./require-hook/loader.mjs")
      .then((ns) => ns.default())
  )

  it("should load builtin modules", () =>
    import("./require-hook/builtin-modules.mjs")
      .then((ns) => ns.default())
  )

  it("should support live binding through bridged modules", () =>
    import("./require-hook/live.mjs")
      .then((ns) => ns.default())
  )

  it("should support live binding through `module.exports`", () =>
    import("./require-hook/live.js")
      .then((ns) => ns.default())
  )

  it("should support named exports", () =>
    import("./require-hook/named")
      .then((ns) => ns.default())
  )

  it("should support namespace exports", () =>
    import("./require-hook/namespace.mjs")
      .then((ns) => ns.default())
  )

  it("should support `options.sourceMap`", () =>
    import("./require-hook/source-map.mjs")
      .then((ns) => ns.default())
  )

  it("should support creating multiple loaders with different options", () =>
    import("./require-hook/mixed.mjs")
      .then((ns) => ns.default())
  )

  it("should error for invalid options", () =>
    import("./require-hook/invalid-options.mjs")
      .then((ns) => ns.default())
  )
})
