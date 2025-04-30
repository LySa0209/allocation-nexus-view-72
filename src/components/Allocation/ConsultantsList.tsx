
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Consultant } from '@/lib/types';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useDataSource } from '@/context/DataSourceContext';
import { fetchConsultantRanking } from '@/lib/api';

interface ConsultantsListProps {
  consultants: Consultant[];
  onAllocateConsultant: (consultant: Consultant) => void;
  selectedConsultants: string[];
  selectedProjectId: string | null;
}

type SeniorityFilter = 'all' | 'leadership' | 'individual';
type TeamStructure = 'lean' | 'balanced' | 'expert';

export const ConsultantsList = ({
  consultants,
  onAllocateConsultant,
  selectedConsultants,
  selectedProjectId
}: ConsultantsListProps) => {
  const { dataSource, setIsLoading } = useDataSource();
  const [searchTerm, setSearchTerm] = useState('');
  const [seniorityFilter, setSeniorityFilter] = useState<SeniorityFilter>('all');
  const [teamStructure, setTeamStructure] = useState<TeamStructure>('balanced');
  const [rankedConsultants, setRankedConsultants] = useState<Consultant[]>([]);

  // Fetch ranked consultants when project or team structure changes
  useEffect(() => {
    if (!selectedProjectId || dataSource !== 'api') {
      // Use default consultant list if no project selected or not using API
      setRankedConsultants([]);
      return;
    }

    const fetchRankedConsultants = async () => {
      try {
        setIsLoading(true);
        const rankingResult = await fetchConsultantRanking({
          allocation_strategy: 'new',
          team_structure: teamStructure,
          project_id: selectedProjectId,
          n: 50
        });
        
        // Map the returned IDs to actual consultant objects
        const rankedConsultantsList = rankingResult.ranking
          .map(id => consultants.find(c => c.id === String(id)))
          .filter(Boolean) as Consultant[];
          
        setRankedConsultants(rankedConsultantsList);
      } catch (error) {
        console.error('Error fetching ranked consultants:', error);
        // Fall back to default filtering if API fails
        setRankedConsultants([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankedConsultants();
  }, [selectedProjectId, teamStructure, dataSource, consultants, setIsLoading]);

  // Determine which consultants to display
  const displayConsultants = rankedConsultants.length > 0 
    ? rankedConsultants 
    : consultants;

  const filterConsultantBySeniority = (consultant: Consultant): boolean => {
    if (seniorityFilter === 'all') return true;
    if (seniorityFilter === 'leadership') {
      return ['Senior Partner', 'Partner', 'Associate Partner', 'Principal'].some(role => 
        consultant.role.toLowerCase().includes(role.toLowerCase())
      );
    }
    return ['Consultant', 'Senior Consultant', 'Associate'].some(role => 
      consultant.role.toLowerCase().includes(role.toLowerCase())
    );
  };

  const filteredConsultants = displayConsultants.filter(consultant => {
    const matchesSearch = searchTerm === '' || 
      consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.expertise.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSeniority = filterConsultantBySeniority(consultant);
    
    // Only show benched consultants if not using ranked list
    const statusCheck = rankedConsultants.length > 0 ? true : consultant.status === "Benched";
    
    return matchesSearch && matchesSeniority && statusCheck;
  });

  // Calculate how much of a consultant is allocated (mock data)
  const getAllocationPercentage = (consultant: Consultant): number => {
    // This would come from allocations data in a real implementation
    const mockPercentages: Record<string, number> = {
      'Benched': 0,
      'Allocated': Math.floor(Math.random() * 50) + 50 // Random between 50-100%
    };
    return mockPercentages[consultant.status] || 0;
  };

  const getBgColorForAllocation = (percentage: number): string => {
    if (percentage > 80) return 'bg-green-500';
    if (percentage > 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full">
      <div className="mb-4">
        <h3 className="font-semibold inline-block">Available Consultants</h3>
        <div className="inline-flex rounded-md shadow-sm ml-4" role="group">
          <Toggle 
            pressed={seniorityFilter === 'all'} 
            onPressedChange={() => setSeniorityFilter('all')}
            className="px-3 py-1 text-sm font-medium rounded-l-lg data-[state=on]:bg-blue-500 data-[state=on]:text-white"
          >
            All
          </Toggle>
          <Toggle 
            pressed={seniorityFilter === 'leadership'} 
            onPressedChange={() => setSeniorityFilter('leadership')}
            className="px-3 py-1 text-sm font-medium border-l border-r border-gray-200 data-[state=on]:bg-blue-500 data-[state=on]:text-white"
          >
            Leadership
          </Toggle>
          <Toggle 
            pressed={seniorityFilter === 'individual'} 
            onPressedChange={() => setSeniorityFilter('individual')}
            className="px-3 py-1 text-sm font-medium rounded-r-lg data-[state=on]:bg-blue-500 data-[state=on]:text-white"
          >
            Individual
          </Toggle>
        </div>
      </div>

      {selectedProjectId && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Team Structure:</p>
          <ToggleGroup 
            type="single" 
            value={teamStructure} 
            onValueChange={(value) => value && setTeamStructure(value as TeamStructure)}
            className="flex justify-start"
          >
            <ToggleGroupItem value="lean" className="px-3 py-1 text-sm">Lean</ToggleGroupItem>
            <ToggleGroupItem value="balanced" className="px-3 py-1 text-sm">Balanced</ToggleGroupItem>
            <ToggleGroupItem value="expert" className="px-3 py-1 text-sm">Expert</ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
          placeholder="Search consultants..."
        />
      </div>

      <ScrollArea className="h-[calc(100%-100px)] pr-4">
        <div className="space-y-2">
          {filteredConsultants.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No consultants available matching your criteria</p>
          ) : (
            filteredConsultants.map(consultant => {
              const allocationPercentage = getAllocationPercentage(consultant);
              const isSelected = selectedConsultants.includes(consultant.id);
              
              return (
                <div 
                  key={consultant.id}
                  className={`p-3 rounded-md hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{consultant.name}</p>
                      <p className="text-xs text-gray-500">{consultant.role} • {consultant.expertise}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${getBgColorForAllocation(allocationPercentage)} h-2 rounded-full`} 
                            style={{ width: `${allocationPercentage}%` }} 
                          />
                        </div>
                        <p className="text-xs text-gray-500 text-right">{allocationPercentage}% allocated</p>
                      </div>
                      <Button
                        onClick={() => onAllocateConsultant(consultant)}
                        variant={isSelected ? "destructive" : "outline"}
                        size="sm"
                      >
                        {isSelected ? 'Remove' : 'Allocate'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
