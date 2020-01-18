const { declare } = require('@babel/helper-plugin-utils')
const { types: { importDeclaration, exportNamedDeclaration, exportAllDeclaration, stringLiteral }} = require('@babel/core')
const { existsSync, lstatSync } = require('fs')
const { resolve, extname, dirname } = require('path')

const isNodeModule = module => {
  try {
    require.resolve(module)
    return true
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      return false
    }
    console.error(e)
  }
}

const skipModule = (module, { replace, extension }) =>
  isNodeModule(module)
  || replace
    ? extname(module) === `.${extension}`
    : extname(module).length

const makeDeclaration =
  ({ declaration, args, replace = false, extension = 'js' }) =>
      (path, { file: { opts: { filename } }}) => {
        const { node: { source } } = path

        if (!source || skipModule(source && source.value, { replace, extension })) return
        const { value: module } = source

        if (module[0] === '.') {
          const dirPath = resolve(dirname(filename), module)
          if (existsSync(dirPath) && lstatSync(dirPath).isDirectory()) {
            path.replaceWith(
              declaration(
                ...args(path),
                stringLiteral(`${module}/index.${extension}`)
              )
            )
          } else {
            path.replaceWith(
              declaration(
                ...args(path),
                stringLiteral(`${module.slice(0,-extname(module).length)}.${extension}`)
              )
            )
          }
        }
    }

module.exports = declare((api, options) => {
  api.assertVersion(7)

  return {
    name: 'add-import-extension',
    visitor: {
      ImportDeclaration: makeDeclaration({
        ...options,
        declaration: importDeclaration,
        args: ({ node: { specifiers } }) => [specifiers]
      }),
      ExportNamedDeclaration: makeDeclaration({
        ...options,
        declaration: exportNamedDeclaration,
        args: ({ node: { declaration, specifiers } }) => [declaration, specifiers]
      }),
      ExportAllDeclaration: makeDeclaration({
        ...options,
        declaration: exportAllDeclaration,
        args: () => []
      })
    }
  }
})
