import Link from "next/link";

export default function Page() {
  return (
    <div className="h-dvh items-center justify-center flex p-5">
      <div className="bg-background rounded-3xl border border-border shadow-md shadow-zinc-300 p-5 flex flex-col max-w-72">
        <div className="mb-5 text-center">
          <h1 className="text-lg font-bold text-center opacity-80">
            LYHS+ 管理中心登入
          </h1>
          <p className="text-sm opacity-50">請點擊下方按鈕前往登入</p>
        </div>
        <Link
          href={
            "https://auth.lyhsca.org/account/login?redirect_url=https://admin.lyhsca.org"
          }
          className="bg-foreground text-background font-medium opacity-80 p-3 rounded-lg w-full text-center hover:opacity-50"
        >
          LYHS+ SSO 登入
        </Link>
        <Link
          href={"https://lyhsca.org"}
          target="_blank"
          className="bg-hoverbg opacity-80 font-medium p-3 mt-3 rounded-lg w-full text-center hover:opacity-50"
        >
          了解更多
        </Link>
        <div className="mt-2 pt-2 px-2 text-sm opacity-50 text-center">
          此網站為LYHS+服務總管理中心，僅限林園高中學生會幹部登入使用。
        </div>
      </div>
    </div>
  );
}
