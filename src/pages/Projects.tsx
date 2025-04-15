
import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import ProjectList from '../components/Projects/ProjectList';
import ProjectDetail from '../components/Projects/ProjectDetail';
import MoveConsultantModal from '../components/Allocation/MoveConsultantModal';
import { 
  projects, 
  pipelineOpportunities, 
  getProjectById, 
  getConsultantsForProject,
  consultants,
  allocations
} from '../data/mockData';
import { useToast } from '@/hooks/use-toast';

const Projects: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') as 'active' | 'pipeline' || 'active';
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'active' | 'pipeline'>(type || 'active');
  const [showAddModal, setShowAddModal] = useState(false);
  const [localConsultants, setLocalConsultants] = useState(consultants);
  const [localAllocations, setLocalAllocations] = useState(allocations);
  const [localProjects, setLocalProjects] = useState(projects);
  const [localPipelineOpportunities, setLocalPipelineOpportunities] = useState(pipelineOpportunities);
  
  // Get the current project or pipeline opportunity
  const currentProject = type === 'active' && id 
    ? getProjectById(id) 
    : undefined;
  
  const currentOpportunity = type === 'pipeline' && id 
    ? pipelineOpportunities.find(opportunity => opportunity.id === id) 
    : undefined;
  
  const currentItem = currentProject || currentOpportunity;
  
  // If we're looking at a project, get its assigned consultants
  const assignedConsultants = currentProject 
    ? getConsultantsForProject(currentProject.id)
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
    // Create a new allocation
    const newAllocation = {
      id: `A${String(localAllocations.length + 1).padStart(3, '0')}`,
      ...data
    };
    
    // Update local allocations
    setLocalAllocations([...localAllocations, newAllocation]);
    
    // Update consultant status to Allocated
    const updatedConsultants = localConsultants.map(c => 
      c.id === data.consultantId ? {
        ...c,
        status: 'Allocated' as const,
        currentProject: data.projectId
      } : c
    );
    setLocalConsultants(updatedConsultants);
    
    // Update project resources assigned
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
    
    // Show success message
    toast({
      title: "Consultant Added",
      description: "The consultant has been successfully added to the project.",
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
      
      {/* Add Consultant Modal */}
      {currentProject && (
        <MoveConsultantModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onConfirm={handleConfirmAdd}
          project={currentProject}
          consultants={localConsultants}
          type="fromProject"
        />
      )}
    </div>
  );
};

export default Projects;
