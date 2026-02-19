import { expect, it } from 'vitest'

it('web-ext environment', async () => {
  const page = await context.newPage()

  // 导航到你想要访问的网站。
  await page.goto('https://www.baidu.com')
  // 等待50s
  // 检查页面标题是否包含 "百度一下，你就知道"。
  await expect(page.title()).resolves.toContain('百度一下，你就知道')
})
