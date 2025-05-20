import React, { useState, useEffect } from 'react';
import { Users, Briefcase, UserCheck, UserMinus, BarChart2, AlertTriangle, Clock } from 'lucide-react';
import { dashboardMetrics as mockDashboardMetrics, consultants as mockConsultants, projects as mockProjects } from '../data/mockData';
import { fetchConsultants, fetchProjects } from '../lib/api';
import Navbar from '../components/Layout/Navbar';
import MetricsCard from '../components/Dashboard/MetricsCard';
import QuickViewList from '../components/Dashboard/QuickViewList';
import { DataSourceSwitch } from '../components/Dashboard/DataSourceSwitch';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useDataSource } from '@/context/DataSourceContext';
import { DashboardMetrics, Consultant, Project, PipelineOpportunity } from '@/lib/types';
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    dataSource,
    setIsLoading
  } = useDataSource();
  const [dashboardMetrics, setDashboardMetrics] = useState(mockDashboardMetrics);
  const [consultants, setConsultants] = useState(mockConsultants);
  const [projects, setProjects] = useState(mockProjects);
  useEffect(() => {
    if (dataSource === 'mock') {
      // Use mock data
      setConsultants(mockConsultants);
      setProjects(mockProjects);
      setDashboardMetrics(mockDashboardMetrics);
      return;
    }

    // Use API data
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [consultantsData, projectsData] = await Promise.all([fetchConsultants(), fetchProjects()]);
        setConsultants(consultantsData);

        // Split projects and pipeline opportunities
        const allProjects = projectsData.filter(p => 'staffingStatus' in p) as Project[];
        setProjects(allProjects);

        // Calculate new metrics
        const benchedConsultants = consultantsData.filter(c => c.status === 'Benched');
        const allocatedConsultants = consultantsData.filter(c => c.status === 'Allocated');
        const newMetrics: DashboardMetrics = {
          totalConsultants: consultantsData.length,
          allocatedConsultants: allocatedConsultants.length,
          benchedConsultants: benchedConsultants.length,
          chargeability: allocatedConsultants.length / (consultantsData.length || 1),
          activeProjects: allProjects.length,
          pipelineProjects: projectsData.length - allProjects.length,
          projectsNeedingResources: allProjects.filter(p => p.staffingStatus === 'Needs Resources').length
        };
        setDashboardMetrics(newMetrics);
        toast({
          title: "Data loaded successfully",
          description: `Loaded ${consultantsData.length} consultants and ${projectsData.length} projects from API.`
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error loading data",
          description: "Could not connect to the API. Check if your backend is running.",
          variant: "destructive"
        });
        // Fall back to mock data if API fails
        setConsultants(mockConsultants);
        setProjects(mockProjects);
        setDashboardMetrics(mockDashboardMetrics);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dataSource, toast, setIsLoading]);

  // Format data for quick view lists
  const projectsNeedingResources = projects.filter(project => project.staffingStatus === 'Needs Resources').map(project => ({
    id: project.id,
    title: project.name,
    subtitle: `Client: ${project.clientName}`,
    value: `Needed: ${project.resourcesNeeded - project.resourcesAssigned}`,
    status: 'Needs Resources',
    linkTo: `/projects/${project.id}?type=active`
  }));
  const consultantsOnBench = consultants.filter(consultant => consultant.status === 'Benched').map(consultant => ({
    id: consultant.id,
    title: consultant.name,
    subtitle: `${consultant.role}, ${consultant.expertise}`,
    status: 'Benched',
    linkTo: `/consultants/${consultant.id}`
  }));
  return <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Resource allocation management overview</p>
          </div>
          <DataSourceSwitch />
        </div>
        
        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard title="Total Consultants" value={dashboardMetrics.totalConsultants} icon={<Users className="h-5 w-5 text-primary" />} />
          
          <MetricsCard title="On Projects" value={dashboardMetrics.allocatedConsultants} icon={<UserCheck className="h-5 w-5 text-primary" />} />
          
          <MetricsCard title="On Bench" value={dashboardMetrics.benchedConsultants} icon={<UserMinus className="h-5 w-5 text-orange-500" />} />
          
          <MetricsCard title="Chargeability" value={`${(dashboardMetrics.chargeability * 100).toFixed(1)}%`} icon={<BarChart2 className="h-5 w-5 text-blue-500" />} trend={{
          value: 2.5,
          isPositive: true
        }} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <MetricsCard title="Active Projects" value={dashboardMetrics.activeProjects} icon={<Briefcase className="h-5 w-5 text-primary" />} description={`${dashboardMetrics.projectsNeedingResources} projects need resources`} />
          
          <MetricsCard title="Pipeline Opportunities" value={dashboardMetrics.pipelineProjects} icon={<Clock className="h-5 w-5 text-blue-500" />} description="Upcoming potential projects" />
        </div>
        
        {/* Quick View Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <QuickViewList title="Projects Needing Resources" items={projectsNeedingResources} emptyMessage="All projects are fully staffed" />
          
          <QuickViewList title="Consultants on Bench" items={consultantsOnBench} emptyMessage="No consultants currently on bench" />
        </div>
      </main>
    </div>;
};
export default Dashboard;