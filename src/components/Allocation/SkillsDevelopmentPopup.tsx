
import React from 'react';
import { X, BookOpen, Target, TrendingUp } from 'lucide-react';
import { Consultant, Project, PipelineOpportunity } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SkillsDevelopmentPopupProps {
  consultant: Consultant | null;
  project: (Project | PipelineOpportunity) | null;
  onClose: () => void;
}

const getRecommendedSkills = (consultant: Consultant, project: Project | PipelineOpportunity): string[] => {
  if (!project) return [];
  
  const projectSector = project.sector || '';
  const consultantSkills = consultant.expertise.toLowerCase().split(',').map(s => s.trim());
  
  // Skills mapping based on project sector
  const sectorSkills: Record<string, string[]> = {
    'Strategy': ['Digital Strategy', 'Market Analysis', 'Customer Experience', 'Business Model Innovation'],
    'Technology': ['Cloud Computing', 'Data Engineering', 'System Architecture', 'Cybersecurity'],
    'Finance': ['Financial Modeling', 'Risk Management', 'Regulatory Compliance', 'M&A Analysis'],
    'Operations': ['Process Engineering', 'Supply Chain Optimization', 'Lean Management', 'Quality Management'],
    'HR': ['Talent Management', 'Organizational Design', 'Change Management', 'Performance Management'],
    'Manufacturing': ['Lean Manufacturing', 'Quality Systems', 'Supply Chain Management', 'Process Optimization'],
    'Healthcare': ['Healthcare Analytics', 'Regulatory Affairs', 'Patient Experience', 'Digital Health'],
    'Retail': ['Customer Analytics', 'Omnichannel Strategy', 'Inventory Management', 'Digital Commerce']
  };
  
  // Get sector-specific skills
  const recommendedSkills = sectorSkills[projectSector] || ['Project Management', 'Client Management', 'Business Analysis', 'Strategic Planning'];
  
  // Filter out skills the consultant already has
  const missingSkills = recommendedSkills.filter(skill => 
    !consultantSkills.some(existing => existing.includes(skill.toLowerCase().split(' ')[0]))
  );
  
  // Always include some general project-relevant skills
  const generalSkills = ['Stakeholder Management', 'Data Analysis', 'Communication Skills', 'Problem Solving'];
  const additionalSkills = generalSkills.filter(skill => 
    !consultantSkills.some(existing => existing.includes(skill.toLowerCase().split(' ')[0]))
  );
  
  return [...missingSkills.slice(0, 3), ...additionalSkills.slice(0, 2)].slice(0, 5);
};

export const SkillsDevelopmentPopup: React.FC<SkillsDevelopmentPopupProps> = ({
  consultant,
  project,
  onClose
}) => {
  if (!consultant || !project) return null;
  
  const recommendedSkills = getRecommendedSkills(consultant, project);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Skills Development</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            Recommended skills for <span className="font-medium">{consultant.name}</span> to develop for the <span className="font-medium">{project.name}</span> project
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center">
              <Target className="h-4 w-4 mr-2 text-blue-500" />
              Current Expertise
            </h4>
            <div className="flex flex-wrap gap-2">
              {consultant.expertise.split(',').map((skill, index) => (
                <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-orange-500" />
              Recommended Skills to Develop
            </h4>
            <div className="space-y-2">
              {recommendedSkills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{skill}</span>
                  <span className="text-xs text-gray-500 bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                    {project.sector} Focus
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <BookOpen className="h-3 w-3 mr-1" />
              Development Priority: High for project success
            </div>
            <div className="text-xs text-gray-600">
              These skills align with the project requirements and will enhance {consultant.name}'s ability to contribute effectively to {project.name}.
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="flex-1">
              Create Development Plan
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
