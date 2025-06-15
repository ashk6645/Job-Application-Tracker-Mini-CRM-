
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useEmailNotifications = () => {
  const { user } = useAuth();

  const sendNotificationEmail = async (
    subject: string, 
    message: string, 
    type: 'application_added' | 'status_changed' | 'follow_up_reminder'
  ) => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          email: user.email,
          subject,
          message,
          type
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending notification email:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Listen for new job applications
    const jobsChannel = supabase
      .channel('job_applications_email_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'job_applications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newJob = payload.new;
          sendNotificationEmail(
            'New Job Application Added',
            `You've successfully added a new application for ${newJob.role} at ${newJob.company}.`,
            'application_added'
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'job_applications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const oldJob = payload.old;
          const newJob = payload.new;
          
          // Only send email if status changed
          if (oldJob.status !== newJob.status) {
            sendNotificationEmail(
              'Application Status Updated',
              `Your application for ${newJob.role} at ${newJob.company} has been updated to "${newJob.status}".`,
              'status_changed'
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(jobsChannel);
    };
  }, [user]);

  return { sendNotificationEmail };
};
