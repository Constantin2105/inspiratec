import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://omtkhfdzckcacywpsnqz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tdGtoZmR6Y2tjYWN5d3BzbnF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2Mzk1NzksImV4cCI6MjA2NzIxNTU3OX0.MyTm7z4dAlyG-v6ldmVA5S8-GFbwxL41ZrOyuiDUWSk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);