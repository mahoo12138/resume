<template>
  <StatusBar />
  <ThemeSwitcher />
  <div id="resume-content">
    <ResumeHeader />
    <ResumeContent />
  </div>
  <Footer />
</template>

<script setup lang="ts">
const { theme, normalizeTheme, storageKey } = useResumeTheme()

useHead(() => ({
  htmlAttrs: {
    'data-theme': theme.value,
  },
}))

onMounted(() => {
  const storedTheme = normalizeTheme(localStorage.getItem(storageKey))

  if (storedTheme !== theme.value) {
    theme.value = storedTheme
  }

  document.documentElement.dataset.theme = theme.value
})

watch(theme, (value) => {
  if (!import.meta.client) {
    return
  }

  document.documentElement.dataset.theme = value
  localStorage.setItem(storageKey, value)
})
</script>

<style lang="less">
@import './styles/index.less';

#resume-content {
  position: relative;
  width: 1024px;
  min-width: 0;
  margin: 64px auto 32px;
  background-color: var(--color-card-bg);
  border-radius: 5px;
  box-shadow: 0 18px 42px -18px var(--color-card-shadow);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow: hidden;
  transition: background-color 0.24s ease, box-shadow 0.24s ease, transform 0.2s ease-in-out, opacity 0.2s ease-in-out;
  opacity: 0;
  transform: translate3d(0, 48px, 0);
  animation: fadeUp 2s cubic-bezier(0.19, 1, 0.22, 1) forwards;

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translate3d(0, 48px, 0);
    }

    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @media screen and (max-width: 1024px) {
    width: 100%;
    margin-top: 0;
    border-radius: 0;
  }
}

@media print {
  #resume-content {
    margin: 0 auto;
    border-radius: 0;
    box-shadow: none;
    padding-bottom: 0;
    overflow: visible;
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
