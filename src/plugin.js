const { declare } = require('@babel/helper-plugin-utils')
const { types: t } = require('@babel/core')
const path = require('path')
const packageJson = require(path.resolve('package.json'))

const dependencies = packageJson.dependencies ? Object.keys(packageJson.dependencies) : []
const devDependencies = packageJson.devDependencies ? Object.keys(packageJson.devDependencies) : []
const peerDependencies = packageJson.peerDependencies ? Object.keys(packageJson.peerDependencies) : []
const optionalDependencies = packageJson.optionalDependencies ? Object.keys(packageJson.optionalDependencies) : []

const nodeModules = [...dependencies, ...devDependencies, ...peerDependencies, ...optionalDependencies]

module.exports = declare((api, options) => {
  api.assertVersion(7)

  const extension = options.extension ? options.extension : 'js'

  return {
    name: 'add-import-extension',
    visitor: {
      ImportDeclaration(path) {
        const module = path.node.source.value
        const isNodeModule = nodeModules.some(key => key === module)

        if (!isNodeModule) {
          path.node.source.value = `${module}.${extension}`
        }
      },
    },
  }
})
