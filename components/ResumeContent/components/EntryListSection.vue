<template>
  <section class="entry-list-section">
    <SectionHeader :title="section.title" />
    <ProjectItem
      v-for="entry in section.entries"
      :key="entry.title"
      :entry="entry"
    />
  </section>
</template>

<script lang="ts" setup>
import SectionHeader from "~/components/SectionHeader.vue";
import ProjectItem from "~/components/ResumeContent/components/ProjectItem.vue";

defineProps<{
  section: ResumeEntryListSection
}>()
</script>

<style scoped>
.entry-list-section {
  margin: 16px 16px 24px;
}
</style>
