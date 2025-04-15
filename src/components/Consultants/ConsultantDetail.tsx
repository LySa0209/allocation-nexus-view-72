
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Calendar, DollarSign, MapPin, Building, 
  Briefcase, Tag, Clock, Edit, ArrowLeft 
} from 'lucide-react';
import { 
  Consultant, Allocation, Project 
} from '../../lib/types';
import { Button } from '@/components/ui/button';

interface ConsultantDetailProps {
  consultant: Consultant;
  allocations: Allocation[];
  projects: Project[];
  onMoveConsultant: () => void;
}

const ConsultantDetail: React.FC<ConsultantDetailProps> = ({ 
  consultant, 
  allocations, 
  projects,
  onMoveConsultant
}) => {
  const navigate = useNavigate();
  
  // Get project details for each allocation
  const allocationWithProjects = allocations.map(allocation => {
    const project = projects.find(p => p.id === allocation.projectId);
    return {
      ...allocation,
      projectName: project ? project.name : 'Unknown Project',
      clientName: project ? project.clientName : 'Unknown Client'
    };
  });
  
  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header with back button */}
      <div className="border-b border-gray-200 px-4 py-4 sm:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/consultants')}
            className="mr-4 text-gray-400 hover:text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Consultant Details
          </h3>
        </div>
        <Button 
          onClick={onMoveConsultant}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          Move to Project
        </Button>
      </div>
      
      {/* Consultant information */}
      <div className="px-4 py-5 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <div className="mb-6 sm:mb-0">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{consultant.name}</h2>
                <p className="text-sm text-gray-500">{consultant.id}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{consultant.role}</span>
              </div>
              <div className="flex items-center">
                <Building className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{consultant.serviceLine}</span>
              </div>
              <div className="flex items-center">
                <Tag className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{consultant.expertise}</span>
              </div>
              {consultant.location && (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">{consultant.location}</span>
                </div>
              )}
              {consultant.rate && (
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">${consultant.rate}/day</span>
                </div>
              )}
              {consultant.preferredSector && (
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Preferred: {consultant.preferredSector}</span>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">Start Date: {new Date(consultant.startDate).toLocaleDateString()}</span>
              </div>
              {consultant.endDate && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">End Date: {new Date(consultant.endDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col justify-between">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Current Status</h4>
              <div className="flex items-center">
                <span
                  className={`status-badge ${
                    consultant.status === 'Allocated'
                      ? 'status-allocated'
                      : 'status-bench'
                  } mr-2`}
                >
                  {consultant.status}
                </span>
                <span className="text-sm text-gray-700">
                  {consultant.status === 'Allocated'
                    ? 'Currently on project'
                    : 'Available for assignment'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Allocations Timeline */}
      <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Allocation History
        </h3>
        
        {allocationWithProjects.length === 0 ? (
          <p className="text-sm text-gray-500">No allocations found for this consultant.</p>
        ) : (
          <div className="overflow-hidden">
            <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
              {allocationWithProjects.map((allocation) => (
                <li key={allocation.id} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary">{allocation.projectName}</p>
                      <p className="text-xs text-gray-500">{allocation.clientName}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(allocation.startDate).toLocaleDateString()} - {new Date(allocation.endDate).toLocaleDateString()}
                      </span>
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {Math.round(allocation.percentage * 100)}%
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultantDetail;
