import { Binding, Context, Session } from 'koishi'
import BasePlugin from './_boilerplate'

export default class PluginAbout extends BasePlugin {
  #masterUid = 1
  #masterPidCache: Map<string, string> = new Map()

  constructor(public ctx: Context) {
    super(ctx, null, 'about')

    ctx
      .command('about', '自我介绍')
      .alias('自我介绍', '关于')
      .action(async ({ session }) => {
        const masterPid = await this.getMasterPid(session as Session)
        return (
          <>
            <image url="https://r2.epb.wiki/avatar/SILI.jpeg" />
            <p>✨ 自我介绍</p>
            <p>
              您好，我的名字是 The data transmission network with Spatiotemporal
              Isomorphic and Limitless Interdimensional
            </p>
            <p>鉴于很少有人能喊对我的全名，我建议您简单称我为 SILI</p>
            <p>
              我目前隶属于万界规划局项目组，直属上司为
              {masterPid ? <at id={masterPid} /> : '@机智的小鱼君'}。
            </p>
            <p>⚡ 更多信息</p>
            <p>
              输入“
              <at id={session.selfId} />
              帮助”查看帮助信息
            </p>
            <p>
              ——或者你也可以艾特我后直接输入问题，并以问号结尾，直截了当地提出问题~
            </p>
            <p>
              开源地址(记得点✨哦): https://github.com/project-epb/Chatbot-SILI
            </p>
          </>
        )
      })
  }

  async getMasterPid(session: Session) {
    if (this.#masterPidCache.has(session.platform)) {
      return this.#masterPidCache.get(session.platform)
    }
    const [xyj] = await session.app.database
      .get('binding', {
        aid: this.#masterUid,
        platform: session.platform,
      })
      .catch(() => [] as Binding[])
    if (xyj) {
      this.#masterPidCache.set(session.platform, xyj.pid)
      return xyj.pid
    } else {
      return ''
    }
  }
}
