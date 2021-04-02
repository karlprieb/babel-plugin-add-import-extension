/* global describe, test, expect */
const babel = require('@babel/core')
const syntaxTypescript = require('@babel/plugin-syntax-typescript')
const plugin = require('../src/plugin.js')

const importStatements = `
import { oneBackLevel } from '..'
import { oneBackLevelIndex } from '../'
import { twoBackLevel } from '../..'
import { twoBackLevelIndex } from '../../'
import { somethingBack } from '../lib/something'
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
export { oneBackLevel } from '..'
export { oneBackLevelIndex } from '../'
export { twoBackLevel } from '../..'
export { twoBackLevelIndex } from '../../'
export { somethingBack } from '../lib/something'
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

const typeOnlyExports = `
export type { NamedType } from './lib/something'
`

const typeOnlyImports = `
import type DefaultType from './lib/something'
import type { NamedType } from './lib/something'
import type * as AllTypes from './lib/something'
`

describe('Replace', () => {
  test.each`
    type                                     | statements          | extension    | replace
    ${'default extension to import'}         | ${importStatements} | ${undefined} | ${undefined}
    ${'custom extension to import'}          | ${importStatements} | ${'jsx'}     | ${undefined}
    ${'default extension to export'}         | ${exportStatements} | ${undefined} | ${undefined}
    ${'custom extension to export'}          | ${exportStatements} | ${'jsx'}     | ${undefined}
    ${'replace default extension to import'} | ${importStatements} | ${undefined} | ${true}
    ${'replace custom extension to import'}  | ${importStatements} | ${'jsx'}     | ${true}
    ${'replace default extension to export'} | ${exportStatements} | ${undefined} | ${true}
    ${'replace custom extension to export'}  | ${exportStatements} | ${'jsx'}     | ${true}
  `('should add the $type statements', ({ statements, extension, replace }) => {
    const { code } = babel.transformSync(statements, {
      plugins: [[plugin, { extension, replace }]],
      filename: ''
    })

    expect(code).toMatchSnapshot()
  })

  test.each`
    type                        | statements         | extension    | replace
    ${'skip type-only imports'} | ${typeOnlyImports} | ${undefined} | ${undefined}
    ${'skip type-only exports'} | ${typeOnlyExports} | ${undefined} | ${true}
    ${'skip type-only imports'} | ${typeOnlyImports} | ${'jsx'}     | ${undefined}
    ${'skip type-only exports'} | ${typeOnlyExports} | ${'jsx'}     | ${true}
  `('should $type', ({ statements, extension, replace }) => {
    const { code } = babel.transformSync(statements, {
      plugins: [syntaxTypescript, [plugin, { extension, replace }]],
      filename: ''
    })

    expect(code).toMatchSnapshot()
  })
})
