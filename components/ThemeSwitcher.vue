<template>
  <aside class="theme-switcher">
    <div class="theme-switcher__stack">
      <transition name="back-top">
        <button
          v-if="isBackToTopVisible"
          type="button"
          class="theme-switcher__top"
          @click="scrollToTop"
        >
          <span class="theme-switcher__top-mark">
            <i class="icon icon-arrow-up" />
          </span>
          <span class="theme-switcher__top-copy">
            <strong>顶部</strong>
            <small>回到页首</small>
          </span>
        </button>
      </transition>

      <div class="theme-switcher__picker" :class="{ 'is-open': isOpen }">
        <transition name="theme-panel">
          <div v-if="isOpen" id="theme-switcher-panel" class="theme-switcher__panel">
            <p class="theme-switcher__title">简历主题</p>
            <div class="theme-switcher__options">
              <button
                v-for="item in themes"
                :key="item.id"
                type="button"
                class="theme-switcher__option"
                :class="{ 'is-active': theme === item.id }"
                @click="handleSelect(item.id)"
              >
                <span class="theme-switcher__swatches">
                  <span
                    v-for="swatch in item.swatches"
                    :key="swatch"
                    class="theme-switcher__swatch"
                    :style="{ backgroundColor: swatch }"
                  />
                </span>
                <span class="theme-switcher__meta">
                  <strong>{{ item.label }}</strong>
                  <small>{{ item.description }}</small>
                </span>
              </button>
            </div>
          </div>
        </transition>

        <button
          type="button"
          class="theme-switcher__toggle"
          :aria-expanded="isOpen"
          aria-controls="theme-switcher-panel"
          @click="isOpen = !isOpen"
        >
          <span class="theme-switcher__toggle-mark"></span>
          <span class="theme-switcher__toggle-copy">
            <strong>主题</strong>
            <small>{{ activeTheme.label }}</small>
          </span>
        </button>
      </div>

      <button ref="printTriggerRef" type="button" class="theme-switcher__print" @click="openPrintDialog">
        <span class="theme-switcher__print-mark">🖶</span>
        <span class="theme-switcher__print-copy">
          <strong>打印</strong>
          <small>PDF 导出</small>
        </span>
      </button>
    </div>
  </aside>

  <Teleport to="body">
    <transition name="print-dialog">
      <div v-if="isPrintDialogOpen" class="print-dialog-backdrop" @click.self="closePrintDialog">
        <section ref="printDialogRef" class="print-dialog" role="dialog" aria-modal="true" aria-labelledby="print-dialog-title" aria-describedby="print-dialog-description" @keydown.esc.stop.prevent="closePrintDialog" @keydown.tab="trapPrintFocus">
          <h2 id="print-dialog-title" class="print-dialog__title">打印简历</h2>
          <p id="print-dialog-description" class="print-dialog__description">
            访客可直接打印公开脱敏版。本人生成投递版时，可输入完整手机号；号码仅用于本次打印，不上传、不保存，网页仍显示遮挡号码。
          </p>
          <label class="print-dialog__field" for="print-phone-input">
            <span>完整手机号（仅投递版需要）</span>
            <input
              id="print-phone-input"
              ref="printPhoneInputRef"
              v-model="printPhoneInput"
              type="tel"
              inputmode="tel"
              autocomplete="off"
              placeholder="请输入完整手机号"
              :aria-invalid="Boolean(printError)"
              :aria-describedby="printError ? 'print-phone-error' : undefined"
              @keyup.enter="printResume('private')"
            >
          </label>
          <p v-if="printError" id="print-phone-error" class="print-dialog__error" role="alert">{{ printError }}</p>
          <div class="print-dialog__actions">
            <button type="button" class="print-dialog__button is-secondary" @click="closePrintDialog">取消</button>
            <button ref="publicPrintRef" type="button" class="print-dialog__button is-primary" :disabled="isPrinting" @click="printResume('public')">打印公开版</button>
            <button type="button" class="print-dialog__button is-secondary" :disabled="isPrinting" @click="printResume('private')">打印投递版</button>
          </div>
        </section>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
const { theme, themes, setTheme } = useResumeTheme()
const { setPrintPhone, clearPrintPhone, normalizePhone, isValidPrintPhone } = useResumePrintPhone()

const isOpen = ref(false)
const isPrintDialogOpen = ref(false)
const printPhoneInput = ref('')
const printError = ref('')
const printPhoneInputRef = ref<HTMLInputElement | null>(null)
const printTriggerRef = ref<HTMLButtonElement | null>(null)
const publicPrintRef = ref<HTMLButtonElement | null>(null)
const printDialogRef = ref<HTMLElement | null>(null)
const isPrinting = ref(false)
const isBackToTopVisible = ref(false)

const activeTheme = computed(() => {
  return themes.find((item) => item.id === theme.value) ?? themes[0]
})

const handleSelect = (themeId: string) => {
  setTheme(themeId)
  isOpen.value = false
}

const focusPrintPhoneInput = () => {
  printPhoneInputRef.value?.focus()
}

const resetPrintData = () => {
  clearPrintPhone()
  printPhoneInput.value = ''
  printError.value = ''
}

const openPrintDialog = async () => {
  isOpen.value = false
  resetPrintData()
  isPrintDialogOpen.value = true
  await nextTick()
  publicPrintRef.value?.focus()
}

const closePrintDialog = () => {
  isPrintDialogOpen.value = false
  resetPrintData()
  printTriggerRef.value?.focus()
}

const trapPrintFocus = (event: KeyboardEvent) => {
  const controls = printDialogRef.value?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)')
  if (!controls?.length) return
  const first = controls[0]
  const last = controls[controls.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}

const printResume = async (mode: 'public' | 'private') => {
  if (!import.meta.client || isPrinting.value) return
  clearPrintPhone()
  const phone = normalizePhone(printPhoneInput.value)

  if (mode === 'private' && !isValidPrintPhone(phone)) {
    printError.value = '打印投递版需要完整手机号；无需号码可选择打印公开版'
    await nextTick()
    focusPrintPhoneInput()
    return
  }

  if (mode === 'private') setPrintPhone(phone)
  printPhoneInput.value = ''
  printError.value = ''
  isPrintDialogOpen.value = false
  isPrinting.value = true

  try {
    await nextTick()
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()))
    window.print()
  } catch {
    resetPrintData()
    printError.value = '无法打开打印窗口，请重试或使用浏览器打印功能'
    isPrintDialogOpen.value = true
    await nextTick()
    publicPrintRef.value?.focus()
  } finally {
    isPrinting.value = false
  }
}

const handleAfterPrint = () => {
  resetPrintData()
  printTriggerRef.value?.focus()
}

let scrollCheckFrame = 0

const updateBackToTopVisibility = () => {
  scrollCheckFrame = 0
  const doc = document.documentElement
  const scrollable = doc.scrollHeight - doc.clientHeight
  isBackToTopVisible.value = scrollable > 0 && window.scrollY / scrollable >= 0.5
}

const requestScrollCheck = () => {
  if (!scrollCheckFrame) {
    scrollCheckFrame = window.requestAnimationFrame(updateBackToTopVisibility)
  }
}

const scrollToTop = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
}

onMounted(() => {
  window.addEventListener('afterprint', handleAfterPrint)
  window.addEventListener('scroll', requestScrollCheck, { passive: true })
  window.addEventListener('resize', requestScrollCheck)
  requestScrollCheck()
})

onBeforeUnmount(() => {
  window.removeEventListener('afterprint', handleAfterPrint)
  window.removeEventListener('scroll', requestScrollCheck)
  window.removeEventListener('resize', requestScrollCheck)
  if (scrollCheckFrame) {
    window.cancelAnimationFrame(scrollCheckFrame)
  }
  resetPrintData()
})</script>

<style lang="less" scoped>
.theme-switcher {
  position: fixed;
  z-index: 30;
  bottom: 5%;
  right: 5%;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  gap: 12px;

  @media screen and (max-width: 1200px) {
    left: auto;
    right: 16px;
    margin-left: 0;
  }

  @media screen and (max-width: 720px) {
    top: auto;
    right: 12px;
    bottom: 72px;
    transform: none;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }

  &__stack {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  &__picker {
    position: relative;
    display: inline-flex;
    justify-content: flex-end;

    @media screen and (max-width: 720px) {
      width: 100%;
    }
  }

  &__toggle,
  &__option,
  &__print,
  &__top {
    border: none;
    cursor: pointer;
    font: inherit;
  }

  &__toggle,
  &__print,
  &__top {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    min-width: 120px;
    padding: 12px 14px;
    border-radius: 18px;
    background: var(--color-switcher-bg);
    border: 1px solid var(--color-switcher-border);
    color: var(--color-text-emphasis);
    box-shadow: 0 16px 40px var(--color-switcher-shadow);
    backdrop-filter: blur(16px);
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

    &:hover {
      transform: translateX(-2px);
      border-color: var(--color-primary-soft-border);
      box-shadow: 0 18px 44px var(--color-switcher-shadow);
    }

    @media screen and (max-width: 720px) {
      min-width: 108px;

      &:hover {
        transform: none;
      }
    }
  }

  &__print {
    gap: 8px;
  }

  &__print-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    border-radius: 999px;
    background-color: var(--color-primary-soft);
    color: var(--color-primary);
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  &__top-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    border-radius: 999px;
    background-color: var(--color-primary-soft);
    color: var(--color-primary);
    font-size: 12px;
  }

  &__toggle-copy,
  &__print-copy,
  &__top-copy {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.2;

    strong {
      font-size: 13px;
      font-weight: 600;
    }

    small {
      margin-top: 3px;
      font-size: 12px;
      color: var(--color-text-subtle);
    }
  }

  &__toggle-mark {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    border-radius: 999px;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-section-bg) 100%);
    box-shadow: 0 0 0 3px var(--color-primary-soft);
  }

  &__panel {
    position: absolute;
    bottom: -100%;
    right: calc(100% + 12px);
    width: 232px;
    padding: 16px;
    border-radius: 22px;
    border: 1px solid var(--color-switcher-border);
    background: var(--color-switcher-bg);
    box-shadow: 0 18px 48px var(--color-switcher-shadow);
    backdrop-filter: blur(16px);
    z-index: 1;

    @media screen and (max-width: 720px) {
      top: auto;
      right: 0;
      bottom: calc(100% + 10px);
      width: min(82vw, 232px);
      transform: none;
    }
  }

  &__title {
    margin: 0 0 12px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.14em;
    color: var(--color-text-subtle);
  }

  &__options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__option {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 12px;
    border-radius: 16px;
    background: transparent;
    color: var(--color-text);
    text-align: left;
    transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
    border: 1px solid transparent;

    &:hover {
      background-color: var(--color-section-bg);
      transform: translateX(-2px);
    }

    &.is-active {
      border-color: var(--color-primary-soft-border);
      background-color: var(--color-primary-soft);
    }
  }

  &__swatches {
    display: inline-flex;
    gap: 6px;
    flex-shrink: 0;
  }

  &__swatch {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.04), inset 0 0 0 1px rgba(255, 255, 255, 0.72);
  }

  &__meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.2;

    strong {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-emphasis);
    }

    small {
      margin-top: 4px;
      font-size: 12px;
      color: var(--color-text-subtle);
    }
  }
}

.theme-panel-enter-active,
.theme-panel-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.theme-panel-enter-from,
.theme-panel-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(8px);
}

.back-top-enter-active,
.back-top-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.back-top-enter-from,
.back-top-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media screen and (max-width: 720px) {
  .theme-panel-enter-from,
  .theme-panel-leave-to {
    transform: translateY(8px);
  }
}

@media print {
  .theme-switcher {
    display: none;
  }
}
</style>

<style lang="less">
.print-dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(18, 26, 35, 0.38);
  backdrop-filter: blur(8px);
}

.print-dialog {
  width: min(100%, 440px);
  max-height: calc(100dvh - 48px);
  overflow-y: auto;
  padding: 24px;
  border-radius: 24px;
  background: var(--color-card-bg);
  color: var(--color-text);
  box-shadow: 0 24px 60px rgba(18, 26, 35, 0.24);

  &__title {
    margin: 0;
    font-size: 22px;
    line-height: 1.2;
    color: var(--color-text-emphasis);
  }

  &__description {
    margin: 10px 0 0;
    font-size: 14px;
    line-height: 1.6;
    color: var(--color-text-subtle);
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 18px;

    span {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-emphasis);
    }

    input {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid var(--color-section-line);
      border-radius: 14px;
      background: var(--color-card-bg);
      color: var(--color-text);
      font: inherit;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 4px var(--color-primary-soft);
      }
    }
  }

  &__error {
    margin: 10px 0 0;
    font-size: 13px;
    color: #d14b4b;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;

    @media screen and (max-width: 560px) {
      flex-direction: column;
    }
  }

  &__button {
    min-width: 110px;
    padding: 11px 16px;
    border-radius: 14px;
    border: 1px solid transparent;
    font: inherit;
    cursor: pointer;
    transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;

    &:hover {
      transform: translateY(-1px);
    }

    &.is-secondary {
      background: var(--color-section-bg);
      color: var(--color-text-emphasis);
      border-color: var(--color-section-line);
    }

    &.is-primary {
      background: var(--color-primary);
      color: var(--color-text-inverse);
    }
  }
}

.print-dialog-enter-active,
.print-dialog-leave-active {
  transition: opacity 0.18s ease;
}

.print-dialog-enter-from,
.print-dialog-leave-to {
  opacity: 0;
}

@media print {
  .print-dialog-backdrop {
    display: none !important;
  }
}
</style>