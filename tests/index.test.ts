import { noop } from '../src'

describe('noop', () => {
  test('noop() returns null', () => {
    expect(noop()).toEqual(null)
  })
})
