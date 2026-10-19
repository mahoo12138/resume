import { normalizePhone, isValidPrintPhone, getDialablePhone } from '~/utils/printPhone'

export const useResumePrintPhone = () => {
  const printPhone = useState<string>('resume-print-phone', () => '')

  const setPrintPhone = (value: string) => {
    printPhone.value = normalizePhone(value)
  }

  const clearPrintPhone = () => {
    printPhone.value = ''
  }

  return {
    printPhone,
    setPrintPhone,
    clearPrintPhone,
    normalizePhone,
    isValidPrintPhone,
    getDialablePhone,
  }
}