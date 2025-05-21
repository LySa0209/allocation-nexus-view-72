
import React, { useState, useEffect } from 'react';
import { Search, User, Star, X, Check, MapPin } from 'lucide-react';
import { Consultant } from '@/lib/types';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useDataSource } from '@/context/DataSourceContext';
import { fetchConsultantRanking } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ConsultantsListProps {
  consultants: Consultant[];
  onAllocateConsultant: (consultant: Consultant) => void;
  selectedConsultants: string[];
  selectedProjectId: string | number | null;
}

interface RankingItem {
  id: string | number;
  score: number;
  flag?: string;
}

type SeniorityFilter = 'all' | 'Senior Manager' | 'Senior Consultant' | 'Consultant' | 'Manager' | 'Partner';
type TeamStructure = 'lean' | 'balanced' | 'expert';

export const ConsultantsList = ({
  consultants,
  onAllocateConsultant,
  selectedConsultants,
  selectedProjectId
}: ConsultantsListProps) => {
  const { toast } = useToast();
  const { dataSource, setIsLoading } = useDataSource();
  const [searchTerm, setSearchTerm] = useState('');
  const [seniorityFilter, setSeniorityFilter] = useState<SeniorityFilter>('all');
  const [teamStructure, setTeamStructure] = useState<TeamStructure>('balanced');
  const [rankedConsultants, setRankedConsultants] = useState<(Consultant & {
    score: number;
    flag?: string;
  })[]>([]);
  const [rankingResult, setRankingResult] = useState<any>(null);

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
          project_id: Number(selectedProjectId),
          n: 20
        });
        console.log('Ranking result:', rankingResult);

        // Map the returned IDs to actual consultant objects and add score
        const rankings = rankingResult.ranking as unknown as RankingItem[];
        const rankedConsultantsList = rankings.map(r => {
          const consultant = consultants.find(c => c.id == r.id);
          if (consultant) {
            return {
              ...consultant,
              score: (r.score + 3) * 10,
              flag: r.flag
            };
          }
          return undefined;
        }).filter(Boolean) as (Consultant & {
          score: number;
          flag?: string;
        })[];
        console.log('Ranked consultants:', rankedConsultantsList);
        setRankedConsultants(rankedConsultantsList);
        setRankingResult(rankingResult); // Save the rankingResult for structure display

        toast({
          title: "Consultants Ranked",
          description: `Showing ${rankingResult.ranking.length} ranked consultants for ${teamStructure} team structure.`
        });
      } catch (error) {
        console.error('Error fetching ranked consultants:', error);
        toast({
          title: "Ranking Failed",
          description: "Could not fetch consultant rankings. Using default list instead.",
          variant: "destructive"
        });
        // Fall back to default filtering if API fails
        setRankedConsultants([]);
        setRankingResult(null);
      } finally {
        setIsLoading(false);
      }
    };
    console.log('Fetching ranked consultants for project:', selectedProjectId, 'with team structure:', teamStructure);
    fetchRankedConsultants();
  }, [selectedProjectId, teamStructure, dataSource, consultants, setIsLoading, toast]);

  // Determine which consultants to display
  const displayConsultants: (Consultant & {
    score?: number;
    flag?: string;
  })[] = rankedConsultants.length > 0 ? rankedConsultants : consultants.map(c => ({
    ...c,
    score: 0
  }));

  const filterConsultantBySeniority = (consultant: Consultant): boolean => {
    if (seniorityFilter === 'all') return true;
    return consultant.role === seniorityFilter;
  };

  const filteredConsultants = displayConsultants.filter(consultant => {
    const matchesSearch = searchTerm === '' || consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) || consultant.role.toLowerCase().includes(searchTerm.toLowerCase()) || consultant.expertise.toLowerCase().includes(searchTerm.toLowerCase());
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
    <div className="bg-white rounded-lg shadow p-4 h-full relative">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold inline-block text-xl">Available Consultants</h3>
      </div>

      {/* Added guidance text */}
      <p className="text-sm text-gray-500 mb-4">Click on allocate to add consultant to the team</p>

      {/* Team structure summary with toggle buttons inline */}
      {selectedProjectId && (
        <div className="mb-4">
          <div className="flex items-center mb-2 gap-2">
            <p className="text-sm text-gray-500 mb-0">Team Structure:</p>
            <ToggleGroup 
              type="single" 
              value={teamStructure} 
              onValueChange={value => value && setTeamStructure(value as TeamStructure)}
              className="inline-flex"
            >
              <ToggleGroupItem value="lean" className="px-3 py-1 text-xs">Lean</ToggleGroupItem>
              <ToggleGroupItem value="balanced" className="px-3 py-1 text-xs">Balanced</ToggleGroupItem>
              <ToggleGroupItem value="expert" className="px-3 py-1 text-xs">Expert</ToggleGroupItem>
            </ToggleGroup>
            {rankingResult?.structure && (
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full ml-2">
                {Object.entries(rankingResult.structure).map(([role, count]) => `${role}: ${count}`).join(', ')}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center gap-2 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input 
          type="text" 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
          placeholder="Search consultants..." 
        />
        <select 
          value={seniorityFilter} 
          onChange={e => setSeniorityFilter(e.target.value as SeniorityFilter)} 
          className="ml-2 px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        >
          <option value="all">All</option>
          <option value="Senior Manager">Senior Manager</option>
          <option value="Senior Consultant">Senior Consultant</option>
          <option value="Consultant">Consultant</option>
          <option value="Manager">Manager</option>
          <option value="Partner">Partner</option>
        </select>
      </div>
      
      {/* Ensure the project is selected before populating bottom left box  */}
      {selectedProjectId ? (
        <ScrollArea className="h-[calc(100%-150px)] pr-4">
          <div className="space-y-2 pb-4">
            {filteredConsultants.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No consultants available matching your criteria</p>
            ) : (
              filteredConsultants.map(consultant => {
                const allocationPercentage = getAllocationPercentage(consultant);
                const isSelected = selectedConsultants.includes(consultant.id);
                const scoreColor = (consultant.score ?? 0) >= 80 
                  ? 'bg-green-100 text-green-800' 
                  : (consultant.score ?? 0) >= 60 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-800';
                
                return (
                  <div 
                    key={consultant.id} 
                    className={`p-2 rounded-lg mb-1 transition-all flex items-center min-h-0 ${
                      isSelected 
                        ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm' 
                        : 'hover:bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    {/* Left Section - Consultant Info - Fixed alignment */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 flex-shrink-0">
                          <User className={`h-5 w-5 ${consultant.flag === 'core' ? 'text-purple-500' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate flex items-center">
                            {consultant.name}
                            {consultant.location && (
                              <span className="flex items-center ml-2 text-xs text-gray-500 font-normal">
                                <MapPin className="h-4 w-4 mr-1" />
                                {consultant.location}
                              </span>
                            )}
                            {(consultant.score ?? 0) >= 80 && (
                              <Star className="h-4 w-4 ml-2 inline text-yellow-500" />
                            )}
                            {consultant.flag === 'core' && (
                              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold border border-purple-300">Core</span>
                            )}
                          </h3>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <span>{consultant.role}</span>
                            <span className="text-xs">•</span>
                            <div className="flex space-x-1">
                              {consultant.expertise.split(',').map((exp, i) => (
                                <span key={i} className="text-xs">{exp.trim()}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Metrics and Actions */}
                    <div className="flex items-center space-x-4 ml-auto">
                      <div className="text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${scoreColor}`}>
                          <span className="text-xs font-medium">{consultant.score ?? 0}%</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">Match</p>
                      </div>
                      <div className="w-20">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-gray-500">Alloc</span>
                          <span className="text-[10px] text-gray-500">{allocationPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`${getBgColorForAllocation(allocationPercentage)} h-1.5 rounded-full`} 
                            style={{width: `${allocationPercentage}%`}} 
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={() => onAllocateConsultant(consultant)} 
                        variant={isSelected ? "destructive" : "outline"} 
                        size="sm" 
                        className="transition-all"
                      >
                        {isSelected ? (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Allocate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500 text-center relative -top-[100px]">Select a project to view available consultants</p>
        </div>
      )}
    </div>
  );
};
