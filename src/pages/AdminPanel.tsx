
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Clock,
  MapPin,
  DollarSign,
  Eye,
  Edit2,
  Trash2
} from 'lucide-react';
import { useJobApplications, type JobApplication } from '@/hooks/useJobApplications';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import { JobApplicationModal } from '@/components/JobApplicationModal';

const AdminPanel = () => {
  const { jobs, loading, updateJobApplication, deleteJobApplication } = useJobApplications();
  const { userRole } = useAuth();
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  if (userRole !== 'admin') {
    return <div>Access denied. Admin privileges required.</div>;
  }

  const statusColors = {
    'Applied': 'bg-blue-100 text-blue-800 border-blue-200',
    'Interview': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Offer': 'bg-green-100 text-green-800 border-green-200',
    'Rejected': 'bg-red-100 text-red-800 border-red-200',
    'Accepted': 'bg-purple-100 text-purple-800 border-purple-200'
  };

  const getStats = () => {
    const totalApplications = jobs.length;
    const uniqueUsers = new Set(jobs.map(job => job.user_id)).size;
    const recentApplications = jobs.filter(job => {
      const appliedDate = new Date(job.applied_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return appliedDate >= weekAgo;
    }).length;

    const statusCounts = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalApplications,
      uniqueUsers,
      recentApplications,
      statusCounts
    };
  };

  const stats = getStats();

  const handleViewJob = (job: JobApplication) => {
    setSelectedJob(job);
    setModalMode('view');
    setIsJobModalOpen(true);
  };

  const handleEditJob = (job: JobApplication) => {
    setSelectedJob(job);
    setModalMode('edit');
    setIsJobModalOpen(true);
  };

  const handleUpdateJob = async (id: string, updates: Partial<JobApplication>) => {
    await updateJobApplication(id, updates);
  };

  const handleDeleteJob = async (id: string) => {
    await deleteJobApplication(id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage all job applications across users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.uniqueUsers}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.recentApplications}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Interviews</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.statusCounts.Interview || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Application Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(stats.statusCounts).map(([status, count]) => (
                <div key={status} className="text-center">
                  <Badge className={`${statusColors[status as keyof typeof statusColors]} mb-2`}>
                    {status}
                  </Badge>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Applications */}
        <Card>
          <CardHeader>
            <CardTitle>All Job Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{job.role}</h3>
                        <Badge className={`${statusColors[job.status]} border`}>
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {job.company}
                        </div>
                        {job.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {job.location}
                          </div>
                        )}
                        {job.salary && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            {job.salary}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-500">
                        Applied: {new Date(job.applied_date).toLocaleDateString()} | 
                        User ID: {job.user_id.slice(0, 8)}...
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleViewJob(job)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditJob(job)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {jobs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No job applications found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job Details Modal */}
        <JobApplicationModal
          job={selectedJob}
          isOpen={isJobModalOpen}
          onClose={() => setIsJobModalOpen(false)}
          onUpdate={handleUpdateJob}
          onDelete={handleDeleteJob}
          mode={modalMode}
        />
      </div>
    </div>
  );
};

export default AdminPanel;
