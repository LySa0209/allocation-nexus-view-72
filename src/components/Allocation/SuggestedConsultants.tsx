
import React from 'react';
import { Consultant, Project, PipelineOpportunity } from '@/lib/types';
import { 
  User, 
  Star, 
  Calendar, 
  ArrowUpDown, 
  Filter,
  Check,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isWithinInterval } from 'date-fns';

interface SuggestedConsultantsProps {
  consultants: Consultant[];
  selectedProject: (Project | PipelineOpportunity) | null;
  onSelectConsultant: (consultant: Consultant) => void;
  onAllocateConsultant: (consultant: Consultant) => void;
  selectedConsultantId: string | null;
}

// Helper function to calculate a match score between consultant and project
const calculateMatchScore = (consultant: Consultant, project: Project | PipelineOpportunity): number => {
  let score = 60; // Base score
  
  // Add points for sector match
  if (consultant.preferredSector && 'sector' in project && project.sector === consultant.preferredSector) {
    score += 20;
  }
  
  // Add points for expertise (simplified)
  if (consultant.expertise && consultant.expertise.includes('Digital') && project.name.includes('Digital')) {
    score += 10;
  } else if (consultant.expertise && consultant.expertise.includes('Data') && project.name.includes('Data')) {
    score += 10;
  }
  
  // Add some points based on rate (higher rate = potentially higher profit margin)
  if (consultant.rate && consultant.rate > 1000) {
    score += 10;
  }
  
  return Math.min(score, 100); // Cap at 100
};

const SuggestedConsultants: React.FC<SuggestedConsultantsProps> = ({
  consultants,
  selectedProject,
  onSelectConsultant,
  onAllocateConsultant,
  selectedConsultantId,
}) => {
  // Filter for consultants on bench
  const availableConsultants = consultants.filter(c => c.status === 'Benched');
  
  // If a project is selected, sort consultants by match score
  const sortedConsultants = selectedProject 
    ? [...availableConsultants].sort((a, b) => {
        const scoreA = calculateMatchScore(a, selectedProject);
        const scoreB = calculateMatchScore(b, selectedProject);
        return scoreB - scoreA; // Higher score first
      })
    : availableConsultants;
  
  // Check if dates overlap with selected project
  const isAvailableForProject = (consultant: Consultant): boolean => {
    if (!selectedProject) return true;
    
    const projectStart = new Date(selectedProject.startDate);
    const projectEnd = new Date(selectedProject.endDate);
    
    // If consultant has end date, check if it's before project starts
    if (consultant.endDate && new Date(consultant.endDate) < projectStart) {
      return false;
    }
    
    // Check if consultant start date is after project ends
    if (new Date(consultant.startDate) > projectEnd) {
      return false;
    }
    
    return true;
  };
  
  // Get only consultants available for the selected project
  const consultantsForProject = selectedProject
    ? sortedConsultants.filter(isAvailableForProject)
    : sortedConsultants;
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {selectedProject 
              ? 'Suggested Consultants' 
              : 'Available Consultants'
            }
          </h3>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-1"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-1"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span>Sort</span>
            </Button>
          </div>
        </div>
        {selectedProject && (
          <div className="mt-2 text-sm text-gray-500">
            Showing best matches for {selectedProject.name}
          </div>
        )}
      </div>
      
      {consultantsForProject.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">
            {selectedProject 
              ? 'No suitable consultants available for this project'
              : 'No consultants currently on bench'
            }
          </p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Consultant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expertise
              </th>
              {selectedProject && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Match Score
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Availability
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {consultantsForProject.map(consultant => {
              const matchScore = selectedProject 
                ? calculateMatchScore(consultant, selectedProject)
                : null;
              
              return (
                <tr 
                  key={consultant.id} 
                  onClick={() => onSelectConsultant(consultant)}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    selectedConsultantId === consultant.id ? 'bg-purple-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{consultant.name}</div>
                        <div className="text-sm text-gray-500">{consultant.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span>{consultant.expertise}</span>
                      {consultant.preferredSector && (
                        <span className="text-xs text-gray-400">
                          Sector: {consultant.preferredSector}
                        </span>
                      )}
                      {consultant.rate && (
                        <span className="text-xs text-gray-400 flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {consultant.rate}/day
                        </span>
                      )}
                    </div>
                  </td>
                  {selectedProject && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                            matchScore && matchScore >= 80 
                              ? 'bg-green-100 text-green-800' 
                              : matchScore && matchScore >= 60
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <span className="text-xs font-medium">{matchScore}%</span>
                        </div>
                        <div>
                          {matchScore && matchScore >= 80 && (
                            <div className="text-xs text-green-600 flex items-center">
                              <Star className="h-3 w-3 mr-1" />
                              Perfect Match
                            </div>
                          )}
                          {consultant.preferredSector && selectedProject.sector === consultant.preferredSector && (
                            <div className="text-xs text-blue-600">
                              Sector Match
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Since {new Date(consultant.startDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {selectedProject ? (
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onAllocateConsultant(consultant);
                        }}
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Check className="h-3 w-3" />
                        <span>Allocate</span>
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onAllocateConsultant(consultant);
                        }}
                        className="flex items-center space-x-1"
                      >
                        <Check className="h-3 w-3" />
                        <span>Allocate</span>
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SuggestedConsultants;
