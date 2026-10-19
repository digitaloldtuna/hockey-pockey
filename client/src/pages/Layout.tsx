import { ReactNode } from 'react';
import AppShell, { BackLink, NavItem } from '../components/ui/AppShell';

type Props = {
  nav?: NavItem[];
  aside?: ReactNode;
  back?: BackLink;
  showBrand?: boolean;
  children: ReactNode;
};

const Layout = ({ nav, aside, back, showBrand, children }: Props) => {
  return (
    <AppShell nav={nav} aside={aside} back={back} showBrand={showBrand}>
      {children}
    </AppShell>
  );
};

export default Layout;
