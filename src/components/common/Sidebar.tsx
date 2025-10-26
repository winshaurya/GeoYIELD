import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Globe, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Scalability', href: '/scalability', icon: Globe },
  { name: 'Reports', href: '/reports', icon: FileText },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col fixed inset-y-0">
      <div className="flex flex-col flex-grow bg-card border-r">
        <div className="flex items-center flex-shrink-0 px-4 py-6">
          <h1 className="text-xl font-bold text-primary">GeoYIELD</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive ? 'bg-primary text-primary-foreground' : ''
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
