<template>
  <header class="resume-header">
    <section class="title-section">
      <div class="applicant-name">
        <h1>{{ data?.name }}<small class="nickname">{{ data?.nickname }}</small></h1>
      </div>
      <div class="desired-job">
        <h2>{{ data?.job }}<small class="location">{{ data?.location }}</small></h2>
      </div>
    </section>
    <section class="info-section">
      <p v-if="data?.experience" class="experience-summary">{{ data.experience }}</p>
      <p v-if="data?.specialty" class="specialty-summary">{{ data.specialty }}</p>
      <p v-if="educationSummary" class="education-summary">{{ educationSummary }}</p>
    </section>
    <section class="contact-section">
      <ul>
        <li>
          <a :href="phoneHref || undefined" target="_blank" class="contact-anchor contact-anchor--phone"
            :data-tooltip="phoneTooltipText" :aria-label="phoneTooltipText">
            <span class="contact-link contact-link--screen contact-link--tooltip">{{ data?.phone }}</span>
            <span class="contact-link contact-link--print">{{ phoneDisplayForPrint }}</span>
            <i class="icon icon-phone"></i>
          </a>
        </li>
        <li>
          <a :href="`mailto:${data?.email}`" target="_blank">
            <span class="contact-link">{{ data?.email }}</span>
            <i class="icon icon-mail"></i>
          </a>
        </li>
        <li>
          <a :href="data?.blog" target="_blank">
            <span class="contact-link">{{ data?.blog }}</span>
            <i class="icon icon-home"></i>
          </a>
        </li>
        <li>
          <a :href="`https://github.com/${data?.github}`" target="_blank">
            <span class="contact-link">github.com/{{ data?.github }}</span>
            <i class="icon icon-github"></i>
          </a>
        </li>
      </ul>
    </section>
  </header>
</template>

<script lang="ts" setup>
const resume = useResumeData()
const { printPhone, getDialablePhone } = useResumePrintPhone()
const data = computed(() => resume.value.information)
const educationSummary = computed(() => {
  return [data.value?.education, data.value?.college, data.value?.major].filter(Boolean).join(' · ')
})

const phoneDisplayForPrint = computed(() => {
  return printPhone.value || data.value?.phone || ''
})

const phoneTooltipText = '手机号已做隐私遮挡'

const phoneHref = computed(() => {
  const phone = printPhone.value || data.value?.phone || ''
  const dialablePhone = getDialablePhone(phone)

  return dialablePhone ? `tel:${dialablePhone}` : ''
})

</script>

<style lang="less" scoped>
@import "@/styles/vars.less";

.resume-header {
  padding: 32px 48px 24px;
  color: var(--color-text-inverse);
  background-color: var(--color-primary);
  overflow: hidden;
  transition: background-color 0.24s ease;

  @media screen and (max-width: 720px) {
    padding: 24px;
  }

  .title-section {
    margin-bottom: 8px;
    border-bottom: 2px solid var(--color-primary-strong);
    font-size: 48px;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media screen and (max-width: 720px) {
      flex-direction: column;
    }

    .applicant-name {
      .nickname {
        padding-left: 8px;
        font-size: 24px;
        font-weight: 400;
        letter-spacing: 0;

        @media screen and (max-width: 720px) {
          display: block;
          padding-left: 0;
          padding-right: 8px;
          font-size: 20px;
          line-height: 28px;
          letter-spacing: 1px;
        }
      }
    }

    .desired-job {
      display: inline;
      font-size: 24px;
      font-weight: 300;

      @media screen and (max-width: 720px) {
        margin: 8px auto 0;
        padding: 16px 4px;
        border-top: 1px solid var(--color-primary-strong);
      }

      .location {
        padding-left: 8px;
        font-size: 14px;
      }
    }
  }

  .info-section {
    padding: 4px;

    p {
      margin: 0;
      line-height: 1.7;
      overflow-wrap: anywhere;
    }

    .experience-summary {
      font-size: 17px;
      font-weight: 600;
    }

    .specialty-summary {
      font-size: 15px;
    }

    .education-summary {
      margin-top: 4px;
      font-size: 13px;
    }
  }




  .info-section {
    float: left;

    @media screen and (max-width: 720px) {
      width: 100%;
      text-align: center;
    }
  }

  .contact-section {
    float: right;
    text-align: right;

    @media screen and (max-width: 720px) {
      width: 100%;
      text-align: center;
    }
  }


  .contact-section {
    padding: 4px;

    ul {
      @media screen and (max-width: 720px) {
        margin: 16px 0 0;
        text-align: center;
      }

      >li {
        height: 24px;

        @media screen and (max-width: 720px) {
          display: inline-flex;
        }

        >a {
          display: inline-flex;
          align-items: center;
          font-family: @font-family-title;
          font-size: 14px;
          line-height: 24px;
          color: var(--color-text-inverse);

          &:hover {
            color: var(--color-text-inverse-muted);
          }

          &.contact-anchor--phone {
            position: relative;

            &::before {
              position: absolute;
              left: 50%;
              opacity: 0;
              pointer-events: none;
              transition: opacity 0.18s ease, transform 0.18s ease;
            }

            &::before {
              content: attr(data-tooltip);
              bottom: calc(100% + 8px);
              z-index: 2;
              width: max-content;
              max-width: 240px;
              padding: 8px 10px;
              border-radius: 10px;
              border: 1px solid var(--color-switcher-border);
              background: var(--color-card-bg);
              box-shadow: 0 14px 32px rgba(18, 26, 35, 0.18);
              color: var(--color-text);
              font-size: 12px;
              line-height: 1.5;
              text-align: left;
              white-space: normal;
              transform: translate(-50%, 6px);
            }

            &:hover::before,
            &:focus-visible::before {
              opacity: 1;
              transform: translate(-50%, 0);
            }

            @media screen and (max-width: 720px) {

              &::before,
              &::after {
                display: none;
              }
            }
          }

          .contact-link {
            &--print {
              display: none;
            }

            @media screen and (max-width: 720px) {
              display: none;
            }
          }

          .icon {
            margin-left: 6px;
            vertical-align: middle;

            @media screen and (max-width: 720px) {
              font-size: 20px;
            }
          }
        }
      }
    }
  }
}

@media print {
  .resume-header {
    .contact-section {
      ul {
        >li {
          >a {
            .contact-link {
              &--screen {
                display: none;
              }

              &--print {
                display: inline;
              }
            }
          }
        }
      }
    }
  }
}
</style>