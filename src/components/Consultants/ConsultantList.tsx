
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { Consultant } from '../../lib/types';

interface ConsultantListProps {
  consultants: Consultant[];
}

const ConsultantList: React.FC<ConsultantListProps> = ({ consultants }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterRole, setFilterRole] = useState<string>('All');
  const [filterServiceLine, setFilterServiceLine] = useState<string>('All');
  
  // Extract unique values for filter dropdowns
  const roles = ['All', ...Array.from(new Set(consultants.map(c => c.role)))];
  const serviceLines = ['All', ...Array.from(new Set(consultants.map(c => c.serviceLine)))];
  
  // Handle filtering and searching
  const filteredConsultants = consultants.filter(consultant => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || 
      consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = filterStatus === 'All' || consultant.status === filterStatus;
    
    // Apply role filter
    const matchesRole = filterRole === 'All' || consultant.role === filterRole;
    
    // Apply service line filter
    const matchesServiceLine = filterServiceLine === 'All' || consultant.serviceLine === filterServiceLine;
    
    return matchesSearch && matchesStatus && matchesRole && matchesServiceLine;
  });
  
  const handleRowClick = (id: string) => {
    navigate(`/consultants/${id}`);
  };
  
  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative inline-block">
            <select
              className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md sm:text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Allocated">Allocated</option>
              <option value="Benched">Benched</option>
            </select>
          </div>
          
          <div className="relative inline-block">
            <select
              className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md sm:text-sm"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          
          <div className="relative inline-block">
            <select
              className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md sm:text-sm"
              value={filterServiceLine}
              onChange={(e) => setFilterServiceLine(e.target.value)}
            >
              {serviceLines.map(line => (
                <option key={line} value={line}>{line}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Consultants Table */}
      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Line</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expertise</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Project</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredConsultants.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No consultants found matching the criteria
                </td>
              </tr>
            ) : (
              filteredConsultants.map((consultant) => (
                <tr 
                  key={consultant.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(consultant.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {consultant.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {consultant.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultant.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultant.serviceLine}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultant.expertise}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`status-badge ${
                        consultant.status === 'Allocated'
                          ? 'status-allocated'
                          : 'status-bench'
                      }`}
                    >
                      {consultant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultant.currentProject || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConsultantList;
