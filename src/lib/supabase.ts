import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zzpvgsfdydhwqnmplvlu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cHZnc2ZkeWRod3FubXBsdmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjc3ODYsImV4cCI6MjA3Mzk0Mzc4Nn0.EiWRgRnWVjUsRtHOKPgmcjeOclVKpLWwMCVvDF7T-fE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)