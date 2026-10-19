<template>
  <article class="project-item" :class="{ 'project-item--nested': nested }">
    <header class="project-item__header">
      <component :is="nested ? 'h4' : 'h3'" class="project-name">
        {{ entry.title }}
      </component>
      <div v-if="entry.meta.length" class="project-role">
        <span
          v-for="(metaItem, index) in entry.meta"
          :key="`${entry.title}-${index}`"
          class="project-role__item"
          v-html="metaItem.html"
        />
      </div>
    </header>
    <div v-if="entry.content" class="project-item__content" v-html="entry.content">
    </div>
  </article>
</template>

<script lang="ts" setup>
defineProps<{
  entry: ResumeEntry
  nested?: boolean
}>()
</script>

<style lang="less" scoped>
.project-item {
  margin-top: 20px;

  & + & {
    margin-top: 24px;
  }

  &--nested:first-child {
    margin-top: 0;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: baseline;
    margin-bottom: 8px;

    @media screen and (max-width: 720px) {
      flex-direction: column;
      gap: 4px;
    }
  }

  &__content {
    line-height: 1.9;
    overflow-wrap: anywhere;
    :deep(p) {
      margin: 0 0 8px;
    }
    :deep(li) {
      position: relative;
      padding-left: 16px;

      & + li {
        margin-top: 5px;
      }
    }

    :deep(li)::before {
      content: '';
      position: absolute;
      left: 2px;
      top: 0.95em;
      width: 4px;
      height: 4px;
      background: var(--color-primary);
      border-radius: 50%;
      transform: translateY(-50%);
    }
  }
}

.project-name {
  min-width: 0;
  font-size: 18px;
  line-height: 1.5;
  font-weight: 600;
  color: var(--color-text-emphasis);
  margin: 0;
  overflow-wrap: anywhere;
}

.project-item--nested .project-name {
  font-size: 17px;
}

.project-item--nested .project-item__content {
  :deep(h5) {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 18px 0 8px;
    font-size: 15px;
    line-height: 1.6;
    font-weight: 700;
    color: var(--color-primary-strong);

    &::after {
      content: '';
      flex: 1;
      min-width: 20px;
      border-top: 1px solid var(--color-section-line);
    }
  }

  :deep(h5 ~ ul),
  :deep(h5 ~ p) {
    margin-left: 12px;
  }
}

.project-role {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  min-width: 0;
  gap: 8px;

  @media screen and (max-width: 720px) {
    justify-content: flex-start;
  }

  &__item {
    min-width: 0;
    font-size: 13px;
    line-height: 1.6;
    font-weight: 500;
    color: var(--color-text-subtle);
    overflow-wrap: anywhere;

    :deep(a) {
      color: inherit;
    }
  }
}

@media print {
  .project-item__header,
  .project-item__content :deep(h5) {
    break-inside: avoid;
    break-after: avoid;
  }

  .project-item__content :deep(p),
  .project-item__content :deep(li) {
    orphans: 2;
    widows: 2;
  }
}
</style>
