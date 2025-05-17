
import React from 'react';

interface AllocationKPIProps {
  totalConsultants: number;
  availableConsultants: number;
  fullyAllocated: number;
  partiallyAllocated: number;
}

export const AllocationKPI = ({
  totalConsultants,
  availableConsultants,
  fullyAllocated,
  partiallyAllocated
}: AllocationKPIProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 col-span-2">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Resource Allocation Dashboard</h3>
          <p className="text-sm text-gray-500">Last updated: Just now</p>
        </div>
        <div className="flex space-x-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Consultants</p>
            <p className="text-xl font-bold">{totalConsultants}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Available</p>
            <p className="text-xl font-bold text-green-500">{availableConsultants}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Fully Allocated</p>
            <p className="text-xl font-bold text-red-500">{fullyAllocated}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Partially Allocated</p>
            <p className="text-xl font-bold text-yellow-500">{partiallyAllocated}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
