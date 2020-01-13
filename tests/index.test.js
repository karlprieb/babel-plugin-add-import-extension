const path = require('path')
const babel = require('@babel/core')
const plugin = require('../src/plugin.js')

const testPath = path.resolve(__dirname)

describe('Import statement', () => {
  const testFile = `${testPath}/import.js`

  it('should add the default extension to necessary import statements', () => {
    const { code } = babel.transformFileSync(testFile, { plugins: [plugin] })
  
    expect(code).toMatchSnapshot()
  })
  
  it('should add custom extension to necessary import statements', () => {
    const { code } = babel.transformFileSync(testFile,
      { plugins: [ [plugin, { extension: 'jsx' }] ] }
    )
    expect(code).toMatchSnapshot()
  })
})

describe('Export statement', () => {
  const testFile = `${testPath}/export.js`

  it('should add the default extension to necessary export statements', () => {
    const { code } = babel.transformFileSync(testFile, { plugins: [plugin] })
  
    expect(code).toMatchSnapshot()
  })

  it('should add custom extension to necessary export statements', () => {
    const { code } = babel.transformFileSync(testFile,
      { plugins: [ [plugin, { extension: 'jsx' }] ] }
    )
    expect(code).toMatchSnapshot()
  })
})