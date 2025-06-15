
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface JobApplication {
  id: string;
  user_id: string;
  company: string;
  role: string;
  status: 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Accepted';
  applied_date: string;
  notes?: string;
  location?: string;
  salary?: string;
  type?: string;
  contact_person?: string;
  follow_up_date?: string;
  job_url?: string;
  created_at: string;
  updated_at: string;
}

export const useJobApplications = () => {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userRole } = useAuth();
  const { toast } = useToast();

  const fetchJobApplications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase.from('job_applications').select('*');
      
      // If user is not admin, only fetch their own applications
      if (userRole !== 'admin') {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query.order('applied_date', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching job applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch job applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addJobApplication = async (jobData: Omit<JobApplication, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('job_applications')
        .insert([{ ...jobData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setJobs(prev => [data, ...prev]);
      
      // Create notification
      await supabase.from('notifications').insert([{
        user_id: user.id,
        title: 'New Job Application Added',
        message: `You applied to ${jobData.company} for ${jobData.role}`,
        type: 'success'
      }]);

      toast({
        title: "Success!",
        description: "Job application added successfully."
      });

      return data;
    } catch (error: any) {
      console.error('Error adding job application:', error);
      toast({
        title: "Error",
        description: "Failed to add job application",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateJobApplication = async (id: string, updates: Partial<JobApplication>) => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setJobs(prev => prev.map(job => job.id === id ? data : job));
      
      // Create notification for status changes
      if (updates.status && user) {
        await supabase.from('notifications').insert([{
          user_id: user.id,
          title: 'Application Status Updated',
          message: `${data.company} - ${data.role} status changed to ${updates.status}`,
          type: 'info'
        }]);
      }

      toast({
        title: "Success!",
        description: "Job application updated successfully."
      });

      return data;
    } catch (error: any) {
      console.error('Error updating job application:', error);
      toast({
        title: "Error",
        description: "Failed to update job application",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteJobApplication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setJobs(prev => prev.filter(job => job.id !== id));

      toast({
        title: "Success!",
        description: "Job application deleted successfully."
      });
    } catch (error: any) {
      console.error('Error deleting job application:', error);
      toast({
        title: "Error",
        description: "Failed to delete job application",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchJobApplications();
    }
  }, [user, userRole]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('job_applications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_applications'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          // Refresh data on any change
          fetchJobApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    jobs,
    loading,
    addJobApplication,
    updateJobApplication,
    deleteJobApplication,
    refetch: fetchJobApplications
  };
};
