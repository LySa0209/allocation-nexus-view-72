import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project, PipelineOpportunity } from '../../lib/types';
interface ProjectListProps {
  projects: Project[];
  pipelineOpportunities: PipelineOpportunity[];
  activeTab: 'active' | 'pipeline';
  onTabChange: (tab: 'active' | 'pipeline') => void;
  onAddNew: () => void;
  onDeleteProject?: (id: string) => void;
  onDeleteOpportunity?: (id: string) => void;
}
const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  pipelineOpportunities,
  activeTab,
  onTabChange,
  onAddNew,
  onDeleteProject,
  onDeleteOpportunity
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterClient, setFilterClient] = useState<string>('All');

  // Extract unique values for filter dropdowns
  const projectStatuses = ['All', ...Array.from(new Set(projects.map(p => p.status)))];
  const projectClients = ['All', ...Array.from(new Set(projects.map(p => p.clientName)))];
  const pipelineStatuses = ['All', ...Array.from(new Set(pipelineOpportunities.map(p => p.status)))];
  const pipelineClients = ['All', ...Array.from(new Set(pipelineOpportunities.map(p => p.clientName)))];

  // Current displayed items based on active tab
  const currentItems = activeTab === 'active' ? projects : pipelineOpportunities;

  // Current filter options based on active tab
  const statusOptions = activeTab === 'active' ? projectStatuses : pipelineStatuses;
  const clientOptions = activeTab === 'active' ? projectClients : pipelineClients;

  // Handle filtering and searching for active projects
  const filteredProjects = projects.filter(project => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || project.name.toLowerCase().includes(searchTerm.toLowerCase()) || project.id.toLowerCase().includes(searchTerm.toLowerCase()) || project.clientName.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply status filter
    const matchesStatus = filterStatus === 'All' || project.status === filterStatus;

    // Apply client filter
    const matchesClient = filterClient === 'All' || project.clientName === filterClient;
    return matchesSearch && matchesStatus && matchesClient;
  });

  // Handle filtering and searching for pipeline opportunities
  const filteredOpportunities = pipelineOpportunities.filter(opportunity => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || opportunity.name.toLowerCase().includes(searchTerm.toLowerCase()) || opportunity.id.toLowerCase().includes(searchTerm.toLowerCase()) || opportunity.clientName.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply status filter
    const matchesStatus = filterStatus === 'All' || opportunity.status === filterStatus;

    // Apply client filter
    const matchesClient = filterClient === 'All' || opportunity.clientName === filterClient;
    return matchesSearch && matchesStatus && matchesClient;
  });
  const handleRowClick = (id: string) => {
    navigate(`/projects/${id}?type=${activeTab}`);
  };
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent row click when deleting
    if (activeTab === 'active' && onDeleteProject) {
      onDeleteProject(id);
    } else if (activeTab === 'pipeline' && onDeleteOpportunity) {
      onDeleteOpportunity(id);
    }
  };
  return <div className="space-y-4">
      {/* Tabs and Add Button */}
      <div className="border-b border-gray-200">
        <div className="flex justify-between items-center">
          <nav className="-mb-px flex space-x-8">
            <button onClick={() => onTabChange('active')} className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}>
              Active Projects
            </button>
            <button onClick={() => onTabChange('pipeline')} className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'pipeline' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}>
              Pipeline Opportunities
            </button>
          </nav>
          
          <Button onClick={onAddNew} className="mb-4 text-zinc-950 bg-lime-600 hover:bg-lime-500">
            <Plus className="w-4 h-4 mr-2" />
            New {activeTab === 'active' ? 'Project' : 'Opportunity'}
          </Button>
        </div>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Search by name, ID, or client..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative inline-block">
            <select className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md sm:text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
          
          <div className="relative inline-block">
            <select className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md sm:text-sm" value={filterClient} onChange={e => setFilterClient(e.target.value)}>
              {clientOptions.map(client => <option key={client} value={client}>{client}</option>)}
            </select>
          </div>
        </div>
      </div>
      
      {/* Projects Table */}
      {activeTab === 'active' ? <div className="table-container">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resources</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staffing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.length === 0 ? <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No projects found matching the criteria
                  </td>
                </tr> : filteredProjects.map(project => <tr key={project.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(project.id)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {project.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`status-badge ${project.status === 'Active' ? 'status-allocated' : project.status === 'On Hold' ? 'status-bench' : 'status-pipeline'}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.resourcesAssigned} / {project.resourcesNeeded}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`status-badge ${project.staffingStatus === 'Fully Staffed' ? 'status-allocated' : 'status-needed'}`}>
                        {project.staffingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button variant="outline" size="sm" onClick={e => handleDelete(e, project.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div> : <div className="table-container">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opportunity Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resources Needed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOpportunities.length === 0 ? <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No opportunities found matching the criteria
                  </td>
                </tr> : filteredOpportunities.map(opportunity => <tr key={opportunity.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(opportunity.id)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {opportunity.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {opportunity.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {opportunity.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="status-badge status-pipeline">
                        {opportunity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {opportunity.winPercentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(opportunity.startDate).toLocaleDateString()} - {new Date(opportunity.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {opportunity.resourcesNeeded}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button variant="outline" size="sm" onClick={e => handleDelete(e, opportunity.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>}
    </div>;
};
export default ProjectList;