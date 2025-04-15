import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import ConsultantList from '../components/Consultants/ConsultantList';
import ConsultantDetail from '../components/Consultants/ConsultantDetail';
import MoveConsultantModal from '../components/Allocation/MoveConsultantModal';
import { 
  consultants, 
  getConsultantById, 
  getAllocationsForConsultant, 
  projects,
  allocations
} from '../data/mockData';
import { useToast } from '@/hooks/use-toast';

const Consultants: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [localConsultants, setLocalConsultants] = useState(consultants);
  const [localAllocations, setLocalAllocations] = useState(allocations);
  const [localProjects, setLocalProjects] = useState(projects);
  
  const consultant = id ? getConsultantById(id) : undefined;
  
  const consultantAllocations = id 
    ? getAllocationsForConsultant(id) 
    : [];
  
  const handleMoveConsultant = () => {
    setShowMoveModal(true);
  };
  
  const handleConfirmMove = (data: {
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
      title: "Consultant Allocated",
      description: "The consultant has been successfully allocated to the project.",
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {id && consultant ? (
          <ConsultantDetail 
            consultant={consultant} 
            allocations={consultantAllocations}
            projects={localProjects}
            onMoveConsultant={handleMoveConsultant}
          />
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Consultants</h1>
              <p className="text-gray-500">Manage your consulting resources</p>
            </div>
            <ConsultantList consultants={localConsultants} />
          </>
        )}
      </main>
      
      {consultant && (
        <MoveConsultantModal
          isOpen={showMoveModal}
          onClose={() => setShowMoveModal(false)}
          onConfirm={handleConfirmMove}
          consultants={[consultant]}
          project={null}
          type="fromProject"
          preselectedConsultant={consultant}
        />
      )}
    </div>
  );
};

export default Consultants;
