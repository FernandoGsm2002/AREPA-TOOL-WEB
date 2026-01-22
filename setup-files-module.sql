-- Create a specific bucket for files storage if we want to use Supabase Storage (optional, but we will focus on Drive links first)
-- We will stick to a table for metadata linking to Google Drive

-- 1. Create the 'files' table
CREATE TABLE IF NOT EXISTS public.files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('Root Testeados', 'Firmwares', 'Drivers', 'Tools', 'Otros')),
    file_url TEXT NOT NULL, -- This will hold the Google Drive Link
    file_size TEXT, -- customized string like "1.2 GB"
    is_premium BOOLEAN DEFAULT TRUE, -- If true, only paid users can see it
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Everyone can read? No, only authenticated users.
-- We'll allow public to query, but we can filter in frontend if we want to hide it completely.
-- Better: Only authenticated users can select.
CREATE POLICY "Enable read access for authenticated users" 
ON public.files FOR SELECT 
TO authenticated 
USING (true);

-- 4. Policy: Only admins can insert/update/delete (we can assume you use the Supabase Dashboard or a future Admin Panel for this)
-- For now, let's allow service role or specific admin users if you have an admin flag.
-- Assuming you manage data via Supabase Dashboard directly for now as per "simple" request.

-- Optional: Insert some dummy data to test
INSERT INTO public.files (title, description, category, file_url, file_size)
VALUES 
('Samsung S23 Ultra Root Package', 'Archivos probados para root s23 ultra bit 1', 'Root Testeados', 'https://drive.google.com/your-file-link', '150 MB'),
('Motorola Stock Firmware Moto G20', 'Rom stock libre de operador', 'Firmwares', 'https://drive.google.com/your-file-link', '2.3 GB');
