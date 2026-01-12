'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/certificate', label: '动态文档生成器' },
  { href: '/templates', label: '模板管理系统' },
  { href: '/batch', label: '批量处理中心' },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-300 flex flex-col shadow-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Link href="/" className="text-transparent bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-500 bg-clip-text font-bold text-xl hover:opacity-80 transition-opacity">DocuFlow</Link>
        </div>
      <nav className="flex-grow p-4">
        <ul>
          {navLinks.map(link => {
            const isActive = pathname.startsWith(link.href);
            return (
              <li key={link.href} className="mb-2">
                <Link
                  href={link.href}
                  className={`block p-3 rounded-lg transition-colors font-medium ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;