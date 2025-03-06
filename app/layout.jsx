import "./globals.css"

export const metadata = {
  title: "小朋友积分乐园",
  description: "完成任务，赢取积分，兑换奖励！",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}



import './globals.css'