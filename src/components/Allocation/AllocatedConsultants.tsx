import React from 'react';
import { X, User, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Consultant } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

// Extend Consultant type for local use to allow score and flag properties
interface AllocatedConsultant extends Consultant {
  score?: number;
  flag?: string;
}
interface AllocatedConsultantsProps {
  consultants: AllocatedConsultant[];
  onRemoveConsultant: (consultantId: string) => void;
  requiredFTEs: number;
  onConfirmAllocation?: () => void;
  confirmLoading?: boolean;
}
export const AllocatedConsultants = ({
  consultants,
  onRemoveConsultant,
  requiredFTEs,
  onConfirmAllocation,
  confirmLoading
}: AllocatedConsultantsProps) => {
  // Calculate total allocation percentage (mock data for now)
  const getAllocationPercentage = (consultant: Consultant): number => {
    // In a real app, this would be based on actual allocation data
    return Math.round(Math.random() * 50) + 50; // Between 50-100%
  };
  const totalAllocationPercentage = consultants.reduce((total, consultant) => {
    return total + getAllocationPercentage(consultant);
  }, 0);
  return <div className="bg-white rounded-lg shadow p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">
      </h3>
        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
          {consultants.length} allocated
        </span>
      </div>

      {consultants.length === 0 ? <div className="text-gray-500 text-center py-8">
          <p>No consultants allocated yet</p>
          <p className="text-xs mt-2">Select consultants from the list to allocate them</p>
        </div> : <div className="space-y-3">
          {consultants.map(consultant => {
        const allocationPercentage = getAllocationPercentage(consultant);
        const scoreColor = (consultant.score ?? 0) >= 80 ? 'bg-green-100 text-green-800' : (consultant.score ?? 0) >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800';
        return <div key={consultant.id} className="allocated-item p-2 rounded-md bg-blue-50 group flex items-center justify-between">
                {/* Left: Consultant Info */}
                <div className="flex items-center space-x-3 min-w-0">
                  <User className={`h-5 w-5 ${consultant.flag === 'core' ? 'text-purple-500' : 'text-gray-400'}`} />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate flex items-center">
                      {consultant.name}
                      {consultant.location && <span className="flex items-center ml-2 text-xs text-gray-500 font-normal">
                          <MapPin className="h-4 w-4 mr-1" />
                          {consultant.location}
                        </span>}
                      {(consultant.score ?? 0) >= 80 && <Star className="h-4 w-4 ml-2 inline text-yellow-500" />}
                      {consultant.flag === 'core' && <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold border border-purple-300">Core</span>}
                    </h3>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      <span>{consultant.role}</span>
                      <span className="text-xs">•</span>
                      <span>{consultant.expertise}</span>
                    </div>
                    
                  </div>
                </div>
                {/* Right: Remove button */}
                <div className="flex items-center gap-6 ml-4 mr-4">
                  <div className="text-right">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${scoreColor}`}>
                      <span className="text-xs font-medium">{consultant.score ?? 0}%</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">Match</p>
                  </div>
                  <button onClick={() => onRemoveConsultant(consultant.id)} className="text-red-500 hover:text-red-700" title="Remove consultant">
                    <X className="h-7 w-7" />
                  </button>
                </div>
              </div>;
      })}
        </div>}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Total Allocation</span>
          <span className="text-sm font-bold">{totalAllocationPercentage}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Required FTEs</span>
          <span className="text-sm font-bold">{requiredFTEs}.0</span>
        </div>

        <Button disabled={consultants.length === 0 || confirmLoading} onClick={onConfirmAllocation} className="mt-4 w-full text-base text-neutral-950">
          {confirmLoading ? 'Allocating...' : 'Confirm Allocation'}
        </Button>
      </div>
    </div>;
};