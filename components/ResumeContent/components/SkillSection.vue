<template>
  <section class="rich-text-section">
    <SectionHeader :title="section.title" />
    <div v-html="section.html"></div>
  </section>
</template>

<script lang="ts" setup>

import SectionHeader from "~/components/SectionHeader.vue";

defineProps<{
  section: ResumeRichTextSection
}>()
</script>

<style lang="less" scoped>
.rich-text-section {
  padding: 16px 16px 24px;

  :deep(ul) {

    li {
      position: relative;
      margin-bottom: 8px;
      padding-left: 20px;
      line-height: 30px;

      &::before {
        content: "";
        position: absolute;
        left: 0.4em;
        top: 0.8em;
        width: 4px;
        height: 4px;
        background-color: var(--color-primary);
        border-radius: 50%;
      }
    }
  }
}
</style>