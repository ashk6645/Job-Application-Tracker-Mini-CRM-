
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MapPin, DollarSign, Calendar, Building2 } from 'lucide-react';
import { JobApplication } from '@/hooks/useJobApplications';

interface ApplicationsGridProps {
  jobs: JobApplication[];
  onViewJob: (job: JobApplication) => void;
}

export const ApplicationsGrid = ({ jobs, onViewJob }: ApplicationsGridProps) => {
  const statusColors = {
    'Applied': 'bg-blue-100 text-blue-800',
    'Interview': 'bg-yellow-100 text-yellow-800',
    'Offer': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Accepted': 'bg-purple-100 text-purple-800'
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
        <p className="text-gray-500">Start by adding your first job application.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <Card key={job.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{job.role}</h3>
                <p className="text-gray-600 font-medium">{job.company}</p>
              </div>
              <Badge className={`${statusColors[job.status]} border-0`}>
                {job.status}
              </Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Applied: {new Date(job.applied_date).toLocaleDateString()}
              </div>
              
              {job.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {job.location}
                </div>
              )}
              
              {job.salary && (
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {job.salary}
                </div>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => onViewJob(job)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
