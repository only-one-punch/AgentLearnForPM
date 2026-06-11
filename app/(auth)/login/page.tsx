import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-copy">
          <span className="section-kicker">Private workbench</span>
          <h1 id="login-title">Agent PM Knowledge Workbench</h1>
          <p>登录后继续阅读、复习弱点、管理笔记与书签。</p>
        </div>
        <LoginForm />
        <Link className="login-back" href="/">
          Return to workbench
        </Link>
      </section>
    </main>
  );
}
