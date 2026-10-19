<template>
  <div class="resume-content">
    <ResumeSectionRenderer
      v-for="section in sections"
      :key="section.key"
      :section="section"
    />
  </div>
</template>

<script lang="ts" setup>
import ResumeSectionRenderer from './components/ResumeSectionRenderer.vue';

const resume = useResumeData()
const sections = computed(() => resume.value.sections)

</script>

<style>
.resume-content {
  min-height: 200px;
  padding: 16px 32px 32px;
  overflow: hidden;

  @media screen and (max-width: 720px) {
    padding: 16px 8px 32px;
  }

  @media print {
    padding-bottom: 0;
    overflow: visible;
  }
}
</style>
