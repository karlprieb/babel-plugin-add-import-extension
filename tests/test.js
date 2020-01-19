const babel = require('@babel/core')
const plugin = require('../src/plugin.js')

const importStatements = `
import { export1 , export2 as alias2 } from './lib/something'
import { something } from './lib/something'
import { something as other } from './lib/something'
import anotherImport from './lib/something'
import another, { otherImport } from './lib/something'
import * as Something from './lib/something'
import { transform } from '@babel/core'
`

const exportStatements = `
export { something } from './lib/something'
export { something as another } from './lib/something'
export * as anotherModule from './lib/something'
export * from './lib/something'
export { transform } from '@babel/core'
`

describe('Replace', () => {
  test.each`
    type                             | statements          | extension
    ${'default extension to import'} | ${importStatements} | ${undefined}
    ${'custom extension to import'}  | ${importStatements} | ${'jsx'}
    ${'default extension to export'} | ${exportStatements} | ${undefined}
    ${'custom extension to export'}  | ${exportStatements} | ${'jsx'}
  `('should add the $type statements', ({statements, extension}) => {
    const { code } = babel.transformSync(statements, {
      plugins: [ [plugin, { extension }] ],
      filename: ''
    })
  
    expect(code).toMatchSnapshot()
  })
})
