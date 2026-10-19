<template>
  <article class="group-block">
    <header class="experience-header">
      <h3 class="company-name">{{ group.title }}</h3>
      <div v-if="group.meta.length" class="experience-meta">
        <template v-for="(metaItem, index) in group.meta" :key="`${group.title}-${index}`">
          <span class="experience-meta__item" v-html="metaItem.html"></span>
        </template>
      </div>
    </header>
    <div class="experience-projects">
      <ProjectItem
        v-for="entry in group.entries"
        :key="entry.title"
        :entry="entry"
        nested
      />
    </div>
  </article>
</template>

<script lang="ts" setup>

import ProjectItem from "~/components/ResumeContent/components/ProjectItem.vue";

defineProps<{
  group: ResumeGroup
}>()
</script>

<style lang="less" scoped>

.group-block {
  margin-top: 20px;

  & + & {
    margin-top: 32px;
  }
}

.experience-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
  padding: 12px 16px;
  background: var(--color-section-bg);
  border-left: 3px solid var(--color-primary-strong);
  border-bottom: 1px solid var(--color-section-line);

  @media screen and (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 10px 12px;
  }
}

.company-name {
  min-width: 0;
  margin: 0;
  font-size: 21px;
  line-height: 1.45;
  font-weight: 700;
  color: var(--color-text-emphasis);
  overflow-wrap: anywhere;
}

.experience-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  max-width: 55%;
  gap: 2px;
  color: var(--color-text-subtle);
  font-size: 13px;
  line-height: 1.6;
  text-align: right;
  overflow-wrap: anywhere;

  @media screen and (max-width: 600px) {
    align-items: flex-start;
    max-width: 100%;
    text-align: left;
  }
}

.experience-projects {
  margin: 16px 0 0 2px;
  padding-left: 20px;
  border-left: 1px solid var(--color-section-line);

  @media screen and (max-width: 600px) {
    padding-left: 12px;
  }
}

@media print {
  .experience-header {
    break-inside: avoid;
    break-after: avoid;
  }
}
</style>
