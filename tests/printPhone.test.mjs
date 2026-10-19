import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizePhone, isValidPrintPhone, getDialablePhone } from '../utils/printPhone.ts'

// 合成测试号码；不使用简历所有者的真实联系方式。
const mobile = '19900000000'

for (const [input, dialable] of [
  [mobile, mobile],
  [`  ${mobile}  `, mobile],
  ['199 0000 0000', mobile],
  ['199-0000-0000', mobile],
  [`86${mobile}`, `86${mobile}`],
  [`+86 ${mobile}`, `+86${mobile}`],
  ['+86-199-0000-0000', `+86${mobile}`],
]) {
  test(`accept formatted complete number: ${JSON.stringify(input)}`, () => {
    assert.equal(isValidPrintPhone(input), true)
    assert.equal(getDialablePhone(input), dialable)
  })
}

for (const input of [
  '', '   ', '15xxxxxxx14', '1990000000', '199000000000', '29900000000',
  `abc${mobile}`, `${mobile}ext`, `++86${mobile}`, `+1${mobile}`,
  `+${mobile}`, `86+${mobile}`, '199/0000/0000', `tel:${mobile}`,
  '１９９００００００００', `<script>${mobile}</script>`,
]) {
  test(`reject incomplete or malformed number: ${JSON.stringify(input)}`, () => {
    assert.equal(isValidPrintPhone(input), false)
    assert.equal(getDialablePhone(input), '')
  })
}

test('normalization does not silently strip invalid characters', () => {
  assert.equal(normalizePhone('  199 0000 0000  '), '199 0000 0000')
  assert.equal(normalizePhone(`  abc${mobile}  `), `abc${mobile}`)
})
