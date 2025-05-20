import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, List } from 'lucide-react';
const Navbar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  return <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center rounded-md border flex items-center gap-2 py-[3px] px-[5px] bg-zinc-300">
                <img src="/lovable-uploads/04ccee57-3568-4ad0-994a-e5a546547e96.png" alt="EY Logo" className="h-8 mr-2" />
                <span className="text-xl font-extrabold text-[#0f161e]">Allocation Nexus</span>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className={`${isActive('/') ? 'border-primary2 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                <LayoutDashboard className="mr-1 h-5 w-5" />
                Dashboard
              </Link>

              <Link to="/consultants" className={`${isActive('/consultants') ? 'border-primary2 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                <Users className="mr-1 h-5 w-5" />
                Consultants
              </Link>

              <Link to="/projects" className={`${isActive('/projects') ? 'border-primary2 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                <Briefcase className="mr-1 h-5 w-5" />
                Projects
              </Link>
              
              <Link to="/allocations" className={`${isActive('/allocations') ? 'border-primary2 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                <List className="mr-1 h-5 w-5" />
                Allocations
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="sm:hidden flex justify-around border-t border-gray-200 bg-white fixed bottom-0 left-0 right-0 z-50">
        <Link to="/" className={`${isActive('/') ? 'text-primary2' : 'text-gray-500'} group flex flex-col items-center px-4 py-2 text-xs font-medium`}>
          <LayoutDashboard className="h-6 w-6" />
          <span>Dashboard</span>
        </Link>

        <Link to="/consultants" className={`${isActive('/consultants') ? 'text-primary2' : 'text-gray-500'} group flex flex-col items-center px-4 py-2 text-xs font-medium`}>
          <Users className="h-6 w-6" />
          <span>Consultants</span>
        </Link>

        <Link to="/projects" className={`${isActive('/projects') ? 'text-primary2' : 'text-gray-500'} group flex flex-col items-center px-4 py-2 text-xs font-medium`}>
          <Briefcase className="h-6 w-6" />
          <span>Projects</span>
        </Link>
        
        <Link to="/allocations" className={`${isActive('/allocations') ? 'text-primary2' : 'text-gray-500'} group flex flex-col items-center px-4 py-2 text-xs font-medium`}>
          <List className="h-6 w-6" />
          <span>Allocations</span>
        </Link>
      </div>
    </nav>;
};
export default Navbar;