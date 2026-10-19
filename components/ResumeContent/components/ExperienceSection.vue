<template>
  <section class="grouped-section">
    <SectionHeader :title="section.title" />
    <template v-for="group in section.groups" :key="group.title">
      <ExperienceItem :group="group"/>
    </template>
  </section>
</template>

<script lang="ts" setup>

import SectionHeader from "~/components/SectionHeader.vue";
import ExperienceItem from "~/components/ResumeContent/components/ExperienceItem.vue";

defineProps<{
  section: ResumeGroupedEntriesSection
}>()
</script>

<style scoped>
.grouped-section {
  margin: 16px 16px 24px;
}
</style>
