
import { Calendar, Building, MapPin, DollarSign, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { JobApplication } from '@/hooks/useJobApplications';

interface ApplicationsGridProps {
  jobs: JobApplication[];
  onViewJob: (job: JobApplication) => void;
}

export const ApplicationsGrid = ({ jobs, onViewJob }: ApplicationsGridProps) => {
  const statusColors = {
    'Applied': 'bg-blue-100 text-blue-800 border-blue-200',
    'Interview': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Offer': 'bg-green-100 text-green-800 border-green-200',
    'Rejected': 'bg-red-100 text-red-800 border-red-200',
    'Accepted': 'bg-purple-100 text-purple-800 border-purple-200'
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Building className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
        <p className="text-gray-600">
          Get started by adding your first job application!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <Card key={job.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {job.role}
                </CardTitle>
                <CardDescription className="flex items-center text-gray-600 mt-1">
                  <Building className="h-4 w-4 mr-1" />
                  {job.company}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={`${statusColors[job.status]} border`}>
                  {job.status}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewJob(job)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
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
            
            {job.notes && (
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                {job.notes}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
