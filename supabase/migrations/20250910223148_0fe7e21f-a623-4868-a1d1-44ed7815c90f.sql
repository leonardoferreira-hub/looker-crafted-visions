-- Create table for authorized emails
CREATE TABLE public.authorized_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.authorized_emails ENABLE ROW LEVEL SECURITY;

-- Create policies for authorized_emails
CREATE POLICY "Admins can manage authorized emails" 
ON public.authorized_emails 
FOR ALL 
USING (public.is_admin());

-- Insert some example authorized emails (you can modify these)
INSERT INTO public.authorized_emails (email, role) VALUES 
('leonardo.ferreira@grupotravessia.com', 'admin'),
('admin@grupotravessia.com', 'admin'),
('viewer@grupotravessia.com', 'viewer');

-- Update the handle_new_user function to check authorized emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email is in authorized list
  IF NOT EXISTS (SELECT 1 FROM public.authorized_emails WHERE email = NEW.email) THEN
    RAISE EXCEPTION 'Email % is not authorized to access this application', NEW.email;
  END IF;

  -- Get role from authorized_emails table
  INSERT INTO public.profiles (user_id, display_name, role)
  SELECT 
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    ae.role
  FROM public.authorized_emails ae
  WHERE ae.email = NEW.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to check if user is authorized
CREATE OR REPLACE FUNCTION public.is_authorized_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.authorized_emails ae
    JOIN auth.users u ON u.email = ae.email
    WHERE u.id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Update profiles policies to only allow authorized users
DROP POLICY "Users can view their own profile" ON public.profiles;
DROP POLICY "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Authorized users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id AND public.is_authorized_user());

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin() AND public.is_authorized_user());

CREATE POLICY "Authorized users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id AND public.is_authorized_user());

CREATE POLICY "Authorized users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND public.is_authorized_user());