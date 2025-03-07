import "./globals.css"
import { AuthProvider } from "./providers/AuthProvider";
import { Toaster } from "sonner";

export const metadata = {
  title: "小朋友积分乐园",
  description: "完成任务，赢取积分，兑换奖励！"
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  )
}
