const { declare } = require('@babel/helper-plugin-utils')
const { types: { importDeclaration, exportNamedDeclaration, exportAllDeclaration, stringLiteral } } = require('@babel/core')
const { existsSync, lstatSync } = require('fs')
const { resolve, extname, dirname } = require('path')

const isNodeModule = module => {
  if (module.startsWith('.') || module.startsWith('/')) {
    return false
  }

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
  !module.startsWith('.') ||
  isNodeModule(module) ||
  (
    replace
      ? extname(module) === `.${extension}`
      : extname(module).length
  )

const makeDeclaration =
  ({ declaration, args, replace = false, extension = 'js' }) =>
    (path, { file: { opts: { filename } } }) => {
      const { node } = path
      const { source, exportKind, importKind } = node

      const isTypeOnly = exportKind === 'type' || importKind === 'type'

      if (!source || isTypeOnly || skipModule(source && source.value, { replace, extension })) return
      const { value: module } = source

      const dirPath = resolve(dirname(filename), module)

      const hasModuleExt = extname(module).length
      const newModuleName = hasModuleExt ? module.slice(0, -extname(module).length) : module

      const pathLiteral = () => {
        if (existsSync(dirPath) && lstatSync(dirPath).isDirectory()) {
          return `${module}${newModuleName.endsWith('/') ? '' : '/'}index.${extension}`
        }

        return `${newModuleName}.${extension}`
      }

      path.replaceWith(
        declaration(
          ...args(path),
          stringLiteral(pathLiteral())
        )
      )
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
