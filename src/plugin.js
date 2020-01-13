const { declare } = require('@babel/helper-plugin-utils')
const { types: { importDeclaration, exportNamedDeclaration, exportAllDeclaration, stringLiteral }} = require('@babel/core')
const { lstatSync } = require('fs')
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

const isDirectory = source => {
  try {
    return lstatSync(source).isDirectory()
  } catch (e) {
    return false
  }
}

const skipModule = module => isNodeModule(module) || extname(module).length > 0

module.exports = declare((api, options) => {
  api.assertVersion(7)

  const extension = options.extension ? options.extension : 'js'

  return {
    name: 'add-import-extension',
    visitor: {
      ImportDeclaration(path, state) {
        const module = path.node.source.value

        if (skipModule(module)) {
          return
        }

        const { filename, cwd } = state.file.opts
        const dir = dirname(filename)

        if (module[0] === '.') {
          if (isDirectory(resolve(dir, module))) {
            path.replaceWith(importDeclaration(path.node.specifiers, stringLiteral(`${module}/index.${extension}`)))
          } else {
            path.replaceWith(importDeclaration(path.node.specifiers, stringLiteral(`${module}.${extension}`)))
          }
        }
      },
      ExportNamedDeclaration(path, state) {
        if (!path.node.source) {
          return
        }

        const module = path.node.source.value

        if (skipModule(module)) {
          return
        }

        const { filename, cwd } = state.file.opts
        const dir = dirname(filename)
        if (module[0] === '.') {
          if (isDirectory(resolve(dir, module))) {
            path.replaceWith(exportNamedDeclaration(path.node.declaration, path.node.specifiers, stringLiteral(`${module}/index.${extension}`)))
          } else {
            path.replaceWith(exportNamedDeclaration(path.node.declaration, path.node.specifiers, stringLiteral(`${module}.${extension}`)))
          }
        }
      },
      ExportAllDeclaration(path, state) {
        if (!path.node.source) {
          return
        }
        const module = path.node.source.value;

        if (skipModule(module)) {
          return
        }

        const { filename, cwd } = state.file.opts
        const dir = dirname(filename)
        if (module[0] === '.') {
          if (isDirectory(resolve(dir, module))) {
            path.replaceWith(exportAllDeclaration(stringLiteral(`${module}/index.${extension}`)))
          } else {
            path.replaceWith(exportAllDeclaration(stringLiteral(`${module}.${extension}`)))
          }
        }
      }
    }
  }
})
