<template>
    <footer id="resume-footer">
      <a
        class="footer-link"
        href="https://github.com/mahoo12138/resume"
        target="_blank">
        <i class="icon icon-link"></i> github.com/mahoo12138/resume
      </a>
      <a
        class="footer-link"
        href="https://github.com/mahoo12138/resume/blob/master/LICENSE"
        target="_blank">
        License: CC-BY-SA-4.0
      </a>
    </footer>
  <footer id="print-footer">
    <a class="footer-link" href="https://resume.mahoo12138.cn" target="_blank">
      <i class="icon icon-link"></i> 网页版简历：resume.mahoo12138.cn
    </a>
  </footer>
</template>

<script lang="ts" setup>

</script>

<style lang="less" scoped>
footer {
  text-align: center;
  transition: all 0.2s ease-in-out;
  animation: fade 1.6s;

  .footer-link {
    display: inline;
    color: var(--color-text-muted);
    transition: color 0.2s ease;

    &:hover {
      color: var(--color-primary);
    }

    .icon {
      width: 13px;
      height: 13px;
      margin-right: 3px;
      vertical-align: -3px;
    }
  }
}

#resume-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  margin-bottom: 16px;
  @media screen and (max-width: 1024px) {
    margin-bottom: 48px;
  }
}
#print-footer {
  display: none;
}
@media print {
  footer {
    width: 1024px;
    margin: 0 auto 12px;
    padding: 0 48px;
    font-size: 11px;
    line-height: 1.6;
    text-align: right;
    animation: none;
  }
  #resume-footer {
    display: none;
  }
  #print-footer {
    display: block;
  }
}
</style>
