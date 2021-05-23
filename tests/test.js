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
import { somethingBackTest } from '../lib/something.test'
import { export1 , export2 as alias2 } from './lib/something'
import { export1Test , export2 as alias2Test } from './lib/something.test'
import { something } from './lib/something'
import { somethingTest } from './lib/something.test'
import { something as other } from './lib/something'
import { something as otherTest } from './lib/something.test'
import anotherImport from './lib/something'
import anotherImportTest from './lib/something.test'
import another, { otherImport } from './lib/something'
import anotherTest, { otherImportTest } from './lib/something.test'
import * as Something from './lib/something'
import * as SomethingTest from './lib/something.test'
import { transform } from '@babel/core'

import { replacer_export1 , replacer_export2 as replacer_alias2 } from './lib/something.ts'
import { replacer_export1Test , replacer_export2 as replacer_alias2Test } from './lib/something.test.ts'
import { replacer_something } from './lib/something.ts'
import { replacer_somethingTest } from './lib/something.test.ts'
import { replacer_something as replacer_other } from './lib/something.ts'
import { replacer_something as replacer_otherTest } from './lib/something.test.ts'
import replacer_anotherImport from './lib/something.ts'
import replacer_anotherImportTest from './lib/something.test.ts'
import replacer_another, { replacer_otherImport } from './lib/something.ts'
import replacer_anotherTest, { replacer_otherImportTest } from './lib/something.test.ts'
import * as replacer_Something from './lib/something.ts'
import * as replacer_SomethingTest from './lib/something.test.ts'
`

const exportStatements = `
export { oneBackLevel } from '..'
export { oneBackLevelIndex } from '../'
export { twoBackLevel } from '../..'
export { twoBackLevelIndex } from '../../'
export { somethingBack } from '../lib/something'
export { somethingBackTest } from '../lib/something.test'
export { something } from './lib/something'
export { somethingTest } from './lib/something.test'
export { something as another } from './lib/something'
export { somethingTest as anotherTest } from './lib/something.test'
export * as anotherModule from './lib/something'
export * as anotherModuleTest from './lib/something.test'
export * from './lib/something'
export * from './lib/something.test'
export { transform } from '@babel/core'

export { replacer_something } from './lib/something.ts'
export { replacer_somethingTest } from './lib/something.test.ts'
export { replacer_something as replacer_another } from './lib/something.ts'
export { replacer_something as replacer_anotherTest } from './lib/something.test.ts'
export * as replacer_anotherModule from './lib/something.ts'
export * as replacer_anotherModuleTest from './lib/something.test.ts'
export * as replacer_something2 from './lib/something.ts'
export * as replacer_something2Test from './lib/something.test.ts'
`

const typeOnlyExports = `
export type { NamedType } from './lib/something'
export type { NamedTypeTest } from './lib/something.test'
`

const typeOnlyImports = `
import type DefaultType from './lib/something'
import type DefaultTypeTest from './lib/something.test'
import type { NamedType } from './lib/something'
import type { NamedTypeTest } from './lib/something.test'
import type * as AllTypes from './lib/something'
import type * as AllTypesTest from './lib/something.test'
`

describe('Replace', () => {
  test.each`
    type                                                  | statements          | extension    | replace      | observedScriptExtensions
    ${'default extension to import'}                      | ${importStatements} | ${undefined} | ${undefined} | ${['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs']}
    ${'custom extension to import'}                       | ${importStatements} | ${'jsx'}     | ${undefined} | ${['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs']}
    ${'custom extension to import not observed'}          | ${importStatements} | ${'jsx'}     | ${undefined} | ${['js', 'ts', 'tsx', 'mjs', 'cjs']}
    ${'custom extension to export'}                       | ${exportStatements} | ${'jsx'}     | ${undefined} | ${['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs']}
    ${'custom extension to export not observed'}          | ${exportStatements} | ${'jsx'}     | ${undefined} | ${['js', 'ts', 'tsx', 'mjs', 'cjs']}
    ${'replace default extension to import'}              | ${importStatements} | ${undefined} | ${true}      | ${['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs']}
    ${'replace custom extension to import'}               | ${importStatements} | ${'jsx'}     | ${true}      | ${['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs']}
    ${'replace custom extension to import not observed'}  | ${importStatements} | ${'jsx'}     | ${true}      | ${['js', 'ts', 'tsx', 'mjs', 'cjs']}
    ${'replace custom extension to export'}               | ${exportStatements} | ${'jsx'}     | ${true}      | ${['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs']}
    ${'replace custom extension to export not observed'}  | ${exportStatements} | ${'jsx'}     | ${true}      | ${['js', 'ts', 'tsx', 'mjs', 'cjs']}
  `('should add the $type statements', ({ statements, extension, replace, observedScriptExtensions }) => {
    const { code } = babel.transformSync(statements, {
      plugins: [[plugin, { extension, replace, observedScriptExtensions }]],
      filename: ''
    })

    expect(code).toMatchSnapshot()
  })

  test.each`
    type                                      | statements         | extension    | replace       | observedScriptExtensions
    ${'skip type-only imports'}               | ${typeOnlyImports} | ${undefined} | ${undefined}  | ${['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs']}
    ${'skip type-only exports'}               | ${typeOnlyExports} | ${undefined} | ${true}       | ${['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs']}
    ${'skip type-only imports'}               | ${typeOnlyImports} | ${'jsx'}     | ${undefined}  | ${['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs']}
    ${'skip type-only imports not observed'}  | ${typeOnlyImports} | ${'jsx'}     | ${undefined}  | ${['js', 'ts', 'tsx', 'mjs', 'cjs']}
    ${'skip type-only exports'}               | ${typeOnlyExports} | ${'jsx'}     | ${true}       | ${['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs']}
    ${'skip type-only exports not observed'}  | ${typeOnlyExports} | ${'jsx'}     | ${true}       | ${['js', 'ts', 'tsx', 'mjs', 'cjs']}
  `('should $type', ({ statements, extension, replace, observedScriptExtensions }) => {
    const { code } = babel.transformSync(statements, {
      plugins: [syntaxTypescript, [plugin, { extension, replace, observedScriptExtensions }]],
      filename: ''
    })

    expect(code).toMatchSnapshot()
  })
})
