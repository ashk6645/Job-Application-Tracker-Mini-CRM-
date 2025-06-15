
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
    // Email notifications are disabled - only in-app notifications
    console.log('Email notification would be sent:', { subject, message, type });
    return null;
  };

  useEffect(() => {
    // Email notifications are disabled - notifications are only in-app
    return () => {};
  }, [user]);

  return { sendNotificationEmail };
};
