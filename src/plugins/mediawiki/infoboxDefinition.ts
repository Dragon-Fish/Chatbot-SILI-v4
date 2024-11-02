/**
 * @example Extend your sites
 * ```ts
 * PluginMediawiki.prototype.INFOBOX_MAP.push({
 *   match: (url: URL) => {},
 *   cssClasses: '',
 * })
 * ```
 */
export const INFOBOX_DEFINITION: {
  match: (url: URL) => boolean
  selector: string | string[]
  injectStyles?: string
}[] = [
  // 萌娘百科
  (() => {
    const selectors = [
      // 标准信息框
      '.mw-parser-output .infotemplatebox',
      '.mw-parser-output table.infobox2',
      // 成句
      '.mw-parser-output table.infoboxSpecial',
      // 旧版兼容
      '.mw-parser-output table.infobox',
    ]
    return {
      match: (url) => url.host.endsWith('moegirl.org.cn'),
      selector: selectors,
      injectStyles: `
        /* 隐藏妨碍截图的元素 */
        ${selectors.join(', ')} {
          visibility: visible;
          :not(&, & *) {
            visibility: hidden;
          }
        }

        /* 调整信息框外观 */
        .mw-parser-output .infotemplatebox {
          margin: 1rem !important;
        }
        `,
    }
  })(),
  // Minecraft Wiki
  {
    match: (url) => url.host === 'minecraft.fandom.com',
    selector: ['.mw-parser-output .notaninfobox'],
  },
  // Fandom (basic)
  {
    match: (url) => url.host.endsWith('fandom.com'),
    selector: ['.mw-parser-output aside.portable-infobox'],
    injectStyles: `.notifications-placeholder { display: none !important }`,
  },
  // 万界规划局
  {
    match: (url) => url.host.endsWith('wjghj.cn'),
    selector: ['.mw-parser-output .portable-infobox:not(.pi-theme-顶部提示小)'],
  },
  // 最终幻想XIV中文维基
  {
    match: (url) => url.host === 'ff14.huijiwiki.com',
    selector: [
      // 道具
      '.mw-parser-output .infobox-item',
      // 任务
      '.mw-parser-output .quest-frame',
      // 副本
      '.mw-parser-output .instance-infobox',
      // 常规
      '.mw-parser-output .ff14-infobox',
    ],
  },
]
