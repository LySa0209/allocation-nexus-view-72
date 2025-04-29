
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import ProjectList from '../components/Projects/ProjectList';
import ProjectDetail from '../components/Projects/ProjectDetail';
import MoveConsultantModal from '../components/Allocation/MoveConsultantModal';
import EditProjectDialog from '../components/Projects/EditProjectDialog';
import { useToast } from '@/hooks/use-toast';
import { useDataSource } from '@/context/DataSourceContext';
import { fetchConsultants, fetchProjects } from '@/lib/api';
import { 
  consultants as mockConsultants, 
  allocations as mockAllocations, 
  projects as mockProjects, 
  pipelineOpportunities as mockPipelineOpportunities,
  getProjectById,
  getConsultantsForProject
} from '../data/mockData';
import { Project, Consultant, PipelineOpportunity } from '@/lib/types';

const Projects: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') as 'active' | 'pipeline' || 'active';
  const { toast } = useToast();
  const { dataSource, setIsLoading } = useDataSource();
  
  const [activeTab, setActiveTab] = useState<'active' | 'pipeline'>(type || 'active');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [localConsultants, setLocalConsultants] = useState(mockConsultants);
  const [localAllocations, setLocalAllocations] = useState(mockAllocations);
  const [localProjects, setLocalProjects] = useState(mockProjects);
  const [localPipelineOpportunities, setLocalPipelineOpportunities] = useState(mockPipelineOpportunities);
  
  useEffect(() => {
    if (dataSource === 'mock') {
      // Use mock data
      setLocalConsultants(mockConsultants);
      setLocalProjects(mockProjects);
      setLocalPipelineOpportunities(mockPipelineOpportunities);
      return;
    }
    
    // Use API data
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [consultantsData, projectsData] = await Promise.all([
          fetchConsultants(),
          fetchProjects()
        ]);
        
        setLocalConsultants(consultantsData);
        
        // Split projects and pipeline opportunities
        const activeProjects = projectsData.filter(p => 'staffingStatus' in p) as Project[];
        const pipelineProjects = projectsData.filter(p => !('staffingStatus' in p)) as PipelineOpportunity[];
        
        setLocalProjects(activeProjects);
        setLocalPipelineOpportunities(pipelineProjects);
        
        toast({
          title: "Data loaded successfully",
          description: `Loaded ${activeProjects.length} active projects and ${pipelineProjects.length} pipeline opportunities from API.`,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error loading data",
          description: "Could not connect to the API. Using mock data instead.",
          variant: "destructive"
        });
        // Fall back to mock data
        setLocalConsultants(mockConsultants);
        setLocalProjects(mockProjects);
        setLocalPipelineOpportunities(mockPipelineOpportunities);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [dataSource, toast, setIsLoading]);
  
  // Helper function to get project by ID from the current source
  const getCurrentProject = (id: string) => {
    return localProjects.find(p => p.id === id);
  };
  
  // Helper function to get opportunity by ID from the current source
  const getCurrentOpportunity = (id: string) => {
    return localPipelineOpportunities.find(o => o.id === id);
  };
  
  // Helper function to get consultants for a project (using current data)
  const getCurrentConsultantsForProject = (projectId: string): Consultant[] => {
    const projectAllocations = localAllocations.filter(a => a.projectId === projectId);
    return localConsultants.filter(c => 
      projectAllocations.some(a => a.consultantId === c.id)
    );
  };
  
  const currentProject = type === 'active' && id 
    ? getCurrentProject(id) 
    : undefined;
  
  const currentOpportunity = type === 'pipeline' && id 
    ? getCurrentOpportunity(id) 
    : undefined;
  
  const currentItem = currentProject || currentOpportunity;
  
  const assignedConsultants = currentProject 
    ? getCurrentConsultantsForProject(currentProject.id)
    : [];
  
  const handleAddConsultant = () => {
    if (currentProject) {
      setShowAddModal(true);
    }
  };
  
  const handleConfirmAdd = (data: {
    consultantId: string;
    projectId: string;
    startDate: string;
    endDate: string;
    percentage: number;
  }) => {
    const newAllocation = {
      id: `A${String(localAllocations.length + 1).padStart(3, '0')}`,
      ...data
    };
    
    setLocalAllocations([...localAllocations, newAllocation]);
    
    const updatedConsultants = localConsultants.map(c => 
      c.id === data.consultantId ? {
        ...c,
        status: 'Allocated' as const,
        currentProject: data.projectId
      } : c
    );
    setLocalConsultants(updatedConsultants);
    
    const updatedProjects = localProjects.map(p => 
      p.id === data.projectId ? {
        ...p,
        resourcesAssigned: p.resourcesAssigned + 1,
        staffingStatus: p.resourcesAssigned + 1 >= p.resourcesNeeded 
          ? 'Fully Staffed' as const 
          : 'Needs Resources' as const
      } : p
    );
    setLocalProjects(updatedProjects);
    
    toast({
      title: "Consultant Added",
      description: "The consultant has been successfully added to the project.",
    });
  };
  
  const handleEditProject = (updatedProject: Project) => {
    const updatedProjects = localProjects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    setLocalProjects(updatedProjects);
    
    toast({
      title: "Project Updated",
      description: "The project details have been successfully updated.",
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {id && currentItem ? (
          <ProjectDetail 
            item={currentItem} 
            type={type} 
            assignedConsultants={assignedConsultants}
            onAddConsultant={handleAddConsultant}
            onEditProject={() => setShowEditModal(true)}
          />
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <p className="text-gray-500">Manage active projects and pipeline opportunities</p>
            </div>
            <ProjectList 
              projects={localProjects} 
              pipelineOpportunities={localPipelineOpportunities} 
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </>
        )}
      </main>
      
      {currentProject && (
        <>
          <MoveConsultantModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onConfirm={handleConfirmAdd}
            project={currentProject}
            consultants={localConsultants}
            type="fromProject"
          />
          <EditProjectDialog
            project={currentProject}
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSave={handleEditProject}
          />
        </>
      )}
    </div>
  );
};

export default Projects;
