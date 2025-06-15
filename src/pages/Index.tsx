
import { useState, useMemo } from 'react';
import { BarChart3, Bell, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { ReminderSystem } from '@/components/ReminderSystem';
import { ExportData } from '@/components/ExportData';
import { JobApplicationModal } from '@/components/JobApplicationModal';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ApplicationsControls } from '@/components/dashboard/ApplicationsControls';
import { ApplicationsGrid } from '@/components/dashboard/ApplicationsGrid';
import { AddJobDialog } from '@/components/dashboard/AddJobDialog';
import { useJobApplications, type JobApplication } from '@/hooks/useJobApplications';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

const Index = () => {
  const { jobs, loading, addJobApplication, updateJobApplication, deleteJobApplication } = useJobApplications();
  const { userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [activeTab, setActiveTab] = useState('overview');

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      const matchesSearch = 
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime();
        case 'date-asc':
          return new Date(a.applied_date).getTime() - new Date(b.applied_date).getTime();
        case 'company':
          return a.company.localeCompare(b.company);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }, [jobs, searchQuery, statusFilter, sortBy]);

  const handleViewJob = (job: JobApplication) => {
    setSelectedJob(job);
    setModalMode('view');
    setIsJobModalOpen(true);
  };

  const handleUpdateJob = async (id: string, updates: Partial<JobApplication>) => {
    await updateJobApplication(id, updates);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading your job applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {userRole === 'admin' ? 'Job Application Management' : 'My Job Applications'}
            </h1>
            <p className="text-gray-600">
              {userRole === 'admin' 
                ? 'Manage job applications across all users' 
                : 'Track and manage your job applications with advanced analytics'
              }
            </p>
          </div>
          
          {userRole === 'admin' && (
            <Button onClick={() => window.location.href = '/admin'} variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Admin Dashboard
            </Button>
          )}
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reminders">
              <Bell className="h-4 w-4 mr-2" />
              Reminders
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <StatsCards jobs={jobs} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReminderSystem jobs={jobs} onUpdateJob={handleUpdateJob} />
              <QuickActions
                onAddApplication={() => setIsAddDialogOpen(true)}
                onViewAnalytics={() => setActiveTab('analytics')}
                onExportData={() => setActiveTab('export')}
              />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard jobs={jobs} />
          </TabsContent>

          <TabsContent value="reminders">
            <ReminderSystem jobs={jobs} onUpdateJob={handleUpdateJob} />
          </TabsContent>

          <TabsContent value="export">
            <ExportData jobs={jobs} />
          </TabsContent>

          <TabsContent value="applications" className="space-y-8">
            <ApplicationsControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              onAddApplication={() => setIsAddDialogOpen(true)}
            />
            <ApplicationsGrid 
              jobs={filteredAndSortedJobs}
              onViewJob={handleViewJob}
            />
          </TabsContent>
        </Tabs>

        <AddJobDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onAdd={addJobApplication}
        />

        <JobApplicationModal
          job={selectedJob}
          isOpen={isJobModalOpen}
          onClose={() => setIsJobModalOpen(false)}
          onUpdate={updateJobApplication}
          onDelete={deleteJobApplication}
          mode={modalMode}
        />
      </div>
    </div>
  );
};

export default Index;
