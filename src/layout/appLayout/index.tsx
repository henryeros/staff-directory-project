'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import Cookies from 'js-cookie';

import Logo from '@/assets/images/logo.svg';
import DashboardIcon from '@/assets/icons/sidebars/dashboard.svg';
import EmployeesIcon from '@/assets/icons/sidebars/employees.svg';
import DepartmentsIcon from '@/assets/icons/sidebars/departments.svg';
import ResourcesIcon from '@/assets/icons/sidebars/resources.svg';
import SettingsIcon from '@/assets/icons/sidebars/settings.svg';
import LogoutIcon from '@/assets/icons/sidebars/logout.svg';
import notificationicon from '@/assets/icons/sidebars/notification.svg';
import profileicon from '@/assets/icons/sidebars/profile.svg';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  destructive?: boolean;
}

interface SidebarContentProps {
  pathname: string;
  onNavClick: () => void;
  onLogout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  nav: readonly NavItem[];
  subnav: readonly NavItem[];
}

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const sidebarVariants: Variants = {
  hidden: { x: '-100%' },
  visible: { x: 0 },
  exit: { x: '-100%' },
};

const navItemVariants: Variants = {
  idle: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 },
};

const SidebarContent = memo<SidebarContentProps>(function SidebarContent({
  pathname,
  onNavClick,
  onLogout,
  loading,
  error,
  nav,
  subnav,
}) {
  const isActive = useCallback(
    (href: string): boolean => pathname === href || (href !== '/' && pathname.startsWith(`${href}/`)),
    [pathname]
  );

  const getIconClass = useCallback(
    (active: boolean, destructive?: boolean): string => (active && !destructive ? 'shrink-0 invert brightness-0' : 'shrink-0'),
    []
  );

  return (
    <>
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Image src={Logo} alt="Tatum Bank Logo" width={140} height={28} priority />
      </motion.div>

      <nav className="space-y-6 mt-4">
        {nav.map(({ label, href, icon: IconSrc }, index) => {
          const active = isActive(href);
          return (
            <motion.div
              key={href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              variants={navItemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                href={href}
                onClick={onNavClick}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors duration-200 ${
                  active ? 'bg-[#002244] text-white' : 'text-[#0F172A] hover:bg-[#E9EEF5]'
                }`}
              >
                <Image src={IconSrc} alt={`${label} Icon`} width={20} height={20} className={getIconClass(active)} />
                <span className="text-base font-normal">{label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="mt-auto" />

      <nav className="space-y-6 pt-4 border-t border-[#EEF2F6]">
        {subnav.map(({ label, href, icon: IconSrc, destructive }, index) => {
          const active = destructive ? false : isActive(href);

          if (destructive) {
            return (
              <motion.div
                key={href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                variants={navItemVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <button
                  type="button"
                  onClick={onLogout}
                  disabled={loading}
                  className="flex w-full items-center gap-3 px-3 py-3 rounded-md transition-colors duration-200 hover:bg-[#FFE5E5] disabled:opacity-50"
                >
                  <Image src={IconSrc} alt="Logout Icon" width={20} height={20} className="shrink-0" />
                  <span className="text-base font-normal text-[#F04438]">{loading ? 'Logging out…' : 'Logout'}</span>
                </button>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
              variants={navItemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                href={href}
                onClick={onNavClick}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors duration-200 ${
                  active ? 'bg-[#002244] text-white' : 'text-[#0F172A] hover:bg-[#E9EEF5]'
                }`}
              >
                <Image src={IconSrc} alt={`${label} Icon`} width={18} height={18} className={getIconClass(active)} />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 text-xs text-red-600"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );
});

SidebarContent.displayName = 'SidebarContent';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname() || '/';
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const nav: readonly NavItem[] = useMemo(
    () => [
      { label: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
      { label: 'Employees', href: '/employees', icon: EmployeesIcon },
      { label: 'Departments', href: '/departments', icon: DepartmentsIcon },
      { label: 'Resources', href: '/resources', icon: ResourcesIcon },
    ],
    []
  );

  const subnav: readonly NavItem[] = useMemo(
    () => [
      { label: 'Settings', href: '/settings', icon: SettingsIcon },
      { label: 'Logout', href: '/logout', icon: LogoutIcon, destructive: true },
    ],
    []
  );

  const cleanPath = useMemo(() => {
    if (!pathname || pathname === '/') return '/';
    return pathname.replace(/\/+$/, '');
  }, [pathname]);

  const pageTitle = useMemo(() => {
    if (cleanPath === '/') return 'Home';
    const seg = cleanPath.split('/').filter(Boolean).pop() || '';
    const label = seg.replace(/-/g, ' ').toLowerCase();
    return label ? label.charAt(0).toUpperCase() + label.slice(1) : 'Home';
  }, [cleanPath]);

  const logout = useCallback(async (): Promise<void> => {
  
     Cookies.remove('access_token');
      Cookies.remove('user');
      router.push('/login');
 
  }, [router]);

  const handleNavClick = useCallback((): void => {
    setMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = useCallback((): void => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const user = Cookies.get('user');
  const userData = useMemo(() => {
    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }, [user]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <aside className="hidden lg:flex w-[20%] min-w-[240px] flex-col bg-[#F9FAFB] border-r border-[#EEF2F6] px-4 py-6 sticky top-0 h-screen overflow-y-auto">
        <SidebarContent
          pathname={cleanPath}
          onNavClick={handleNavClick}
          onLogout={logout}
          loading={loading}
          error={error}
          nav={nav}
          subnav={subnav}
        />
      </aside>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleMobileMenu}
            />
            <motion.aside
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 right-0 h-full w-full bg-[#F9FAFB] z-50 flex flex-col px-4 py-6 lg:hidden overflow-y-auto"
            >
              <motion.button
                onClick={toggleMobileMenu}
                className="absolute top-6 right-4 p-2 hover:bg-[#E9EEF5] rounded-md transition-colors duration-200"
                aria-label="Close menu"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </motion.button>

              <SidebarContent
                pathname={cleanPath}
                onNavClick={handleNavClick}
                onLogout={logout}
                loading={loading}
                error={error}
                nav={nav}
                subnav={subnav}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="w-full lg:w-[80%] min-h-screen lg:p-4 p-2 overflow-y-auto">
        <motion.header
          className="bg-[#F9FAFB] rounded-[8px] flex flex-row justify-between px-4 py-4 items-center mb-5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 lg:hidden">
            <motion.button
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-[#E9EEF5] rounded-md transition-colors duration-200"
              aria-label="Open menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </motion.button>
            <Image src={Logo} alt="Tatum Bank Logo" width={100} height={20} />
          </div>

          <motion.p
            className="hidden lg:block text-[#344054] text-[24px] font-semibold"
            key={cleanPath}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {pageTitle}
          </motion.p>

          <div className="flex flex-row gap-4 items-center">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Image src={notificationicon} alt="notification icon" className="w-5 h-5 lg:w-6 lg:h-6" />
            </motion.div>
            <motion.div className="flex flex-row gap-2 items-center" whileHover={{ scale: 1.02 }}>
              <Image src={profileicon} alt="profile icon" className="w-8 h-8 lg:w-10 lg:h-10" />
              {userData && (
                <div className="hidden sm:block">
                  <p className="text-[#101828] font-medium text-sm lg:text-base">{userData.displayName}</p>
                  <p className="text-[#475467] font-light text-xs lg:text-sm">{userData.jobTitle}</p>
                </div>
              )}
            </motion.div>
          </div>
        </motion.header>

        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
          {children}
        </motion.section>
      </main>
    </div>
  );
}
