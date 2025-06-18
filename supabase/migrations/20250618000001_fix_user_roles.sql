-- Fix user_roles policies and add a function to safely create user roles
-- This migration adds better RLS policies and a safe role creation function

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;

-- Create a more permissive policy for role creation that allows the system to create roles
CREATE POLICY "Allow role creation for authenticated users" 
  ON public.user_roles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    role IN ('applicant', 'admin')
  );

-- Create a secure function to get or create user role
CREATE OR REPLACE FUNCTION public.get_or_create_user_role(p_user_id UUID DEFAULT auth.uid())
RETURNS app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Try to get existing role
  SELECT role INTO user_role 
  FROM public.user_roles 
  WHERE user_id = p_user_id;
  
  -- If no role found, create default 'applicant' role
  IF user_role IS NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_user_id, 'applicant')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    user_role := 'applicant';
  END IF;
  
  RETURN user_role;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_or_create_user_role TO authenticated;

-- Update the existing get_user_role function to use the safe version
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT public.get_or_create_user_role(user_id);
$$;
