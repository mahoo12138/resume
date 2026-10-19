// 仅校验大陆手机号的格式，不验证号码归属或是否真实存在。
// 允许空格、连字符和 86 / +86 前缀，不静默过滤字母等无效字符。
export const normalizePhone = (value: string): string => value.trim()

export const isValidPrintPhone = (value: string): boolean => {
  const compact = normalizePhone(value).replace(/[\s-]/g, '')
  return /^(?:\+?86)?1\d{10}$/.test(compact)
}

export const getDialablePhone = (value: string): string => {
  if (!isValidPrintPhone(value)) return ''
  return normalizePhone(value).replace(/[\s-]/g, '')
}
