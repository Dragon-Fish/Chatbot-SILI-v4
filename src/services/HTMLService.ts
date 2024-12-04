import { Context, Service, h } from 'koishi'

import type { ScreenshotOptions, WaitForOptions } from 'puppeteer-core'
import type { BundledLanguage } from 'shiki'

declare module 'koishi' {
  export interface Context {
    html: HTMLService
  }
}

export default class HTMLService extends Service {
  static inject = ['puppeteer']
  readonly log: ReturnType<Context['logger']>

  constructor(public ctx: Context) {
    super(ctx, 'html')
    this.log = ctx.logger('HTML')
  }

  get ppt() {
    return this.ctx.puppeteer
  }

  async rawHtml(
    html: string,
    selector: string = 'body',
    shotOptions?: ScreenshotOptions
  ): Promise<Buffer | undefined> {
    shotOptions = {
      encoding: 'binary',
      type: 'jpeg',
      quality: 90,
      ...shotOptions,
    }
    if (shotOptions.type !== 'jpeg') {
      delete shotOptions.quality
    }
    const page = await this.ppt.page()
    let file: Buffer | undefined
    try {
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 15 * 1000,
      })
      const $el = await page.$(selector)
      file = await $el?.screenshot(shotOptions)
    } finally {
      await page?.close()
    }
    return file
  }

  async html(
    body: string,
    selector: string = 'body',
    options?: ScreenshotOptions
  ) {
    const html = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <!-- <link rel="stylesheet" href="https://fonts.googlefonts.cn/css?family=Noto+Sans+SC"> -->
  <style>
    :root {
      font-family: 'Noto Sans SC', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      font-size: 14px;
      color: #252525;
    }
    html, body {
      margin: 0;
      padding: 0;
    }
    * {
      box-sizing: border-box;
    }
  </style>
</head>

<body>
${body}
</body>
</html>`
    return this.rawHtml(html, selector, options)
  }

  async text(text: string) {
    return this.html(`<pre>${this.preformattedText(text)}</pre>`, 'pre')
  }

  async svg(svg: string) {
    return this.rawHtml(svg, 'svg')
  }

  hljs(code: string, lang = '', startFrom: number | false = 1) {
    const html = `
<link rel="stylesheet" href="https://unpkg.com/highlight.js@11.6.0/styles/atom-one-dark.css">
<style>
.hljs-ln-numbers {
  user-select: none;
  text-align: center;
  color: #ccc;
  border-right: 1px solid #CCC;
  vertical-align: top;
  padding-right: 0.5rem !important;
}
.hljs-ln-code {
  padding-left: 1rem !important;
}
.hljs-ln-line {
  white-space: break-spaces;
  max-width: calc(100vw - 6rem);
  word-wrap: break-word;
}
code.hljs {
  position: relative;
}
code.hljs[class*='lang-']:before {
  position: absolute;
  color: #fff;
  z-index: 3;
  line-height: 1;
  top: 1rem;
  right: 1rem;
  background-color: #000;
  padding: 0.2rem 0.4rem;
  border-radius: 1rem;
}
code.hljs[class~='lang-js']:before,
code.hljs[class~='lang-javascript']:before {
  content: 'js';
}
code.hljs[class~='lang-lua']:before {
  content: 'lua';
}
code.hljs[class~='lang-ts']:before,
code.hljs[class~='lang-typescript']:before {
  content: 'ts';
}
code.hljs[class~='lang-html']:before,
code.hljs[class~='lang-markup']:before {
  content: 'html';
}
code.hljs[class~='lang-md']:before,
code.hljs[class~='lang-markdown']:before {
  content: 'md';
}
code.hljs[class~='lang-vue']:before {
  content: 'vue';
}
code.hljs[class~='lang-css']:before {
  content: 'css';
}
code.hljs[class~='lang-sass']:before {
  content: 'sass';
}
code.hljs[class~='lang-scss']:before {
  content: 'scss';
}
code.hljs[class~='lang-less']:before {
  content: 'less';
}
code.hljs[class~='lang-stylus']:before {
  content: 'stylus';
}
code.hljs[class~='lang-go']:before {
  content: 'go';
}
code.hljs[class~='lang-java']:before {
  content: 'java';
}
code.hljs[class~='lang-c']:before {
  content: 'c';
}
code.hljs[class~='lang-sh']:before {
  content: 'sh';
}
code.hljs[class~='lang-yaml']:before {
  content: 'yaml';
}
code.hljs[class~='lang-py']:before {
  content: 'py';
}
code.hljs[class~='lang-docker']:before {
  content: 'docker';
}
code.hljs[class~='lang-dockerfile']:before {
  content: 'dockerfile';
}
code.hljs[class~='lang-makefile']:before {
  content: 'makefile';
}
code.hljs[class~='lang-json']:before {
  content: 'json';
}
code.hljs[class~='lang-ruby']:before {
  content: 'rb';
}
code.hljs[class~='lang-python']:before {
  content: 'py';
}
code.hljs[class~='lang-bash']:before {
  content: 'sh';
}
code.hljs[class~='lang-php']:before {
  content: 'php';
}
code.hljs[class~='lang-wiki']:before {
  content: 'wiki';
}
</style>
<pre screenshot-target class="hljs"><code class="hljs ${
      lang ? 'lang-' + lang : ''
    }">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
<script src="https://unpkg.com/@highlightjs/cdn-assets@11.6.0/highlight.min.js"></script>
<script src="https://unpkg.com/highlightjs-line-numbers.js@2.8.0/src/highlightjs-line-numbers.js"></script>
<script>;(() => {
  const target = document.querySelector('pre[screenshot-target] code')
  if (target.innerText.length > 100000) {
    return
  }
  hljs.highlightElement(target)
  const startFrom = (${startFrom})
  typeof startFrom === 'number &&
    hljs.lineNumbersBlock(target, {
      startFrom: ${Math.max(1, +startFrom)},
      singleLine: true,
    })
})()</script>
`

    return this.html(html, `pre[screenshot-target]`)
  }

  async shiki(
    code: string,
    lang: BundledLanguage,
    startFrom: number | false = 1
  ) {
    const { bundledLanguages, bundledLanguagesInfo, codeToHtml } = await import(
      'shiki'
    )

    if ((lang as any) !== '' && !(lang in bundledLanguages)) {
      throw new Error(`Language not supported: ${lang}`)
    }

    const langInfo = bundledLanguagesInfo.find((i) => i.aliases?.includes(lang))
    const langLabel = langInfo?.aliases?.[0] || langInfo.name || lang
    const html = await codeToHtml(code, {
      lang: langInfo.id || '',
      theme: 'one-dark-pro',
      transformers: [
        {
          pre(node) {
            node.properties.style += ';'
            node.properties.style += `padding-right: ${(10 * langLabel.length + 12).toFixed()}px;`
          },
          code(node) {
            node.properties.style += ';'
            node.properties.style += `--start: ${typeof startFrom === 'number' ? startFrom : 1};`
          },
          postprocess(html) {
            return html.replace(
              /<\/pre>/,
              `<code class="lang-badge">${langLabel}</code></pre>`
            )
          },
        },
      ],
    })
    const css = `
<style>
pre.shiki {
  position: relative;
  font-family: 'Fira Code', 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
  font-size: 16px;
  display: inline-block;
  padding: 1em;
  border-radius: 0.5em;
  white-space: pre;
}
pre.shiki code.lang-badge {
  position: absolute;
  right: 0.5em;
  top: 0.5em;
  font-size: 10px;
  border-radius: 99vw;
  background: #000;
  padding: 0.2em 0.5em;
}
/* line number */
pre.shiki code {
  counter-reset: step;
  counter-increment: step calc(var(--start, 1) - 1);
}
pre.shiki code .line::before {
  content: counter(step);
  counter-increment: step;
  width: 1rem;
  margin-right: 1.5rem;
  display: inline-block;
  text-align: right;
  color: rgba(115,138,148,.4)
}
</style>
`
    return this.html(html + css, 'pre.shiki', {
      type: 'png',
      omitBackground: true,
    })
  }

  async shotByUrl(
    url: string | URL,
    selector?: string,
    waitOptioins?: WaitForOptions,
    shotOptions?: ScreenshotOptions
  ) {
    // handle options
    waitOptioins = {
      waitUntil: 'networkidle0',
      timeout: 21 * 1000,
      ...waitOptioins,
    }
    shotOptions = {
      encoding: 'binary',
      type: 'jpeg',
      quality: 90,
      ...shotOptions,
    }
    if (shotOptions.type !== 'jpeg') {
      delete shotOptions.quality
    }

    const page = await this.ctx.puppeteer.page()

    let isInitialized = false
    page.on('load', () => {
      isInitialized = true
    })

    page.on('dialog', async (dialog) => {
      // console.log(`弹窗类型: ${dialog.type()}`)
      // console.log(`弹窗信息: ${dialog.message()}`)
      this.log.info(
        '[shotByUrl]',
        `dialog detected: ${dialog.type()}`,
        dialog.message()
      )
      await dialog.dismiss().catch((e) => {
        this.log.warn('[shotByUrl]', 'failed to dismiss dialog:', e)
      })
    })

    return page
      .goto(url.toString(), waitOptioins)
      .then(async () => {
        const target = selector ? await page.$(selector) : page
        if (target) {
          return target?.screenshot(shotOptions)
        } else {
          throw new Error(`Element not found: ${selector}`)
        }
      })
      .catch(async (e) => {
        this.log.warn('[shotByUrl]', `faild to load page: ${url}`, e)
        if (isInitialized) {
          const target = selector ? await page.$(selector) : page
          if (target) {
            this.log.warn(
              '[shotByUrl]',
              'but target found, take it anyway:',
              target,
              selector
            )
            return target?.screenshot(shotOptions)
          }
        } else {
          throw e
        }
      })
      .finally(() => page.close())
  }

  preformattedText(text: string) {
    return text.replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  }
  dropXSS = this.preformattedText
  propsToText(props: Record<string, string>) {
    return Object.entries(props)
      .map(([key, value]) => `${key}="${this.propValueToText(value)}"`)
      .join(' ')
  }
  propValueToText(value: string) {
    return value
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .trim()
  }
}
