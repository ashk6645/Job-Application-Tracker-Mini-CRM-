import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Shield, Briefcase } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <nav className="bg-white shadow-sm border-b px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Job Tracker</h1>
          {userRole === 'admin' && (
            <Badge variant="outline" className="ml-2">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          )}
        </div>        
        <div className="flex items-center gap-4">
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="hidden md:inline">{user?.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                <div className="flex flex-col">
                  <span className="font-medium">{user?.email}</span>
                  <span className="text-xs text-gray-500 capitalize">{userRole} Account</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
