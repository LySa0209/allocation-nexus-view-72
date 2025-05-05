import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Consultant } from '@/lib/types';

interface AllocatedConsultantsProps {
  consultants: Consultant[];
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

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Allocated to Project</h3>
        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
          {consultants.length} allocated
        </span>
      </div>

      {consultants.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          <p>No consultants allocated yet</p>
          <p className="text-xs mt-2">Select consultants from the list to allocate them</p>
        </div>
      ) : (
        <div className="space-y-3">
          {consultants.map(consultant => {
            const allocationPercentage = getAllocationPercentage(consultant);
            
            return (
              <div key={consultant.id} className="allocated-item p-3 rounded-md bg-blue-50 group">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{consultant.name}</p>
                    <p className="text-xs text-gray-500">{consultant.role} • {allocationPercentage}% allocation</p>
                  </div>
                  <button 
                    onClick={() => onRemoveConsultant(consultant.id)}
                    className="remove-btn text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Total Allocation</span>
          <span className="text-sm font-bold">{totalAllocationPercentage}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Required FTEs</span>
          <span className="text-sm font-bold">{requiredFTEs}.0</span>
        </div>

        <Button 
          className="mt-4 w-full" 
          disabled={consultants.length === 0 || confirmLoading}
          onClick={onConfirmAllocation}
        >
          {confirmLoading ? 'Allocating...' : 'Confirm Allocation'}
        </Button>
      </div>
    </div>
  );
};
