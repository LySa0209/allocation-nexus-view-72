
import React from 'react';
import { 
  Users, Briefcase, UserCheck, UserMinus, 
  BarChart2, AlertTriangle, Clock 
} from 'lucide-react';
import { dashboardMetrics, consultants, projects } from '../data/mockData';
import Navbar from '../components/Layout/Navbar';
import MetricsCard from '../components/Dashboard/MetricsCard';
import QuickViewList from '../components/Dashboard/QuickViewList';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Format data for quick view lists
  const projectsNeedingResources = projects
    .filter(project => project.staffingStatus === 'Needs Resources')
    .map(project => ({
      id: project.id,
      title: project.name,
      subtitle: `Client: ${project.clientName}`,
      value: `Needed: ${project.resourcesNeeded - project.resourcesAssigned}`,
      status: 'Needs Resources',
      linkTo: `/projects/${project.id}?type=active`
    }));
  
  const consultantsOnBench = consultants
    .filter(consultant => consultant.status === 'Benched')
    .map(consultant => ({
      id: consultant.id,
      title: consultant.name,
      subtitle: `${consultant.role}, ${consultant.expertise}`,
      status: 'Benched',
      linkTo: `/consultants/${consultant.id}`
    }));
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Resource allocation management overview</p>
        </div>
        
        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Total Consultants"
            value={dashboardMetrics.totalConsultants}
            icon={<Users className="h-5 w-5 text-primary" />}
          />
          
          <MetricsCard
            title="On Projects"
            value={dashboardMetrics.allocatedConsultants}
            icon={<UserCheck className="h-5 w-5 text-green-600" />}
          />
          
          <MetricsCard
            title="On Bench"
            value={dashboardMetrics.benchedConsultants}
            icon={<UserMinus className="h-5 w-5 text-orange-500" />}
          />
          
          <MetricsCard
            title="Chargeability"
            value={`${(dashboardMetrics.chargeability * 100).toFixed(1)}%`}
            icon={<BarChart2 className="h-5 w-5 text-blue-500" />}
            trend={{
              value: 2.5,
              isPositive: true
            }}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <MetricsCard
            title="Active Projects"
            value={dashboardMetrics.activeProjects}
            icon={<Briefcase className="h-5 w-5 text-primary" />}
            description={`${dashboardMetrics.projectsNeedingResources} projects need resources`}
          />
          
          <MetricsCard
            title="Pipeline Opportunities"
            value={dashboardMetrics.pipelineProjects}
            icon={<Clock className="h-5 w-5 text-blue-500" />}
            description="Upcoming potential projects"
          />
        </div>
        
        {/* Quick View Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <QuickViewList
            title="Projects Needing Resources"
            items={projectsNeedingResources}
            emptyMessage="All projects are fully staffed"
          />
          
          <QuickViewList
            title="Consultants on Bench"
            items={consultantsOnBench}
            emptyMessage="No consultants currently on bench"
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
