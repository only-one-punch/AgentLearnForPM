import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/library", label: "文章" },
  { href: "/docs/04-tool-calling", label: "阅读" },
  { href: "/library#about", label: "关于" },
];

export function WorkbenchShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        跳到正文
      </a>
      <header className="site-header">
        <Link className="site-brand" href="/" aria-label="Agent PM 技术资料首页">
          <span className="brand-mark">A</span>
          <strong>Agent PM</strong>
          <small>技术资料</small>
        </Link>
        <nav className="site-nav" aria-label="主导航">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className="header-search" href="/library">
          搜索文档、术语、章节
        </Link>
      </header>
      {children}
      <footer className="site-footer" id="about">
        <span>Agent PM 技术资料 · Markdown 驱动的个人博客站</span>
        <span>Source: agent-pm-tech-knowledge/</span>
      </footer>
    </div>
  );
}
