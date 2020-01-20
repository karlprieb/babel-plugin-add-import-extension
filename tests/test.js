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

import { replacer_export1 , replacer_export2 as replacer_alias2 } from './lib/something.ts'
import { replacer_something } from './lib/something.ts'
import { replacer_something as replacer_other } from './lib/something.ts'
import replacer_anotherImport from './lib/something.ts'
import replacer_another, { replacer_otherImport } from './lib/something.ts'
import * as replacer_Something from './lib/something.ts'
`

const exportStatements = `
export { something } from './lib/something'
export { something as another } from './lib/something'
export * as anotherModule from './lib/something'
export * from './lib/something'
export { transform } from '@babel/core'

export { replacer_something } from './lib/something.ts'
export { replacer_something as replacer_another } from './lib/something.ts'
export * as replacer_anotherModule from './lib/something.ts'
export * as replacer_something2 from './lib/something.ts'
`

describe('Replace', () => {
  test.each`
    type                             | statements          | extension    | replace
    ${'default extension to import'} | ${importStatements} | ${undefined} | ${undefined}
    ${'custom extension to import'}  | ${importStatements} | ${'jsx'}     | ${undefined}
    ${'default extension to export'} | ${exportStatements} | ${undefined} | ${undefined}
    ${'custom extension to export'}  | ${exportStatements} | ${'jsx'}     | ${undefined}
    ${'replace default extension to import'} | ${importStatements} | ${undefined} | ${true}
    ${'replace custom extension to import'} | ${importStatements} | ${'jsx'}     | ${true}
    ${'replace default extension to export'} | ${exportStatements} | ${undefined} | ${true}
    ${'replace custom extension to export'} | ${exportStatements} | ${'jsx'}     | ${true}
  `('should add the $type statements', ({ statements, extension, replace }) => {
    const { code } = babel.transformSync(statements, {
      plugins: [ [plugin, { extension, replace }] ],
      filename: ''
    })
  
    expect(code).toMatchSnapshot()
  })
})
