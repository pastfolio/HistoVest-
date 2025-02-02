require('dotenv').config();  // Load environment variables from .env file

const { createClient } = require('@supabase/supabase-js');

// Use your environment variables (ensure they're set up in your .env file)
const supabaseUrl = 'https://gylghrvcatjnpyqqaumu.supabase.co';  // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5bGdocnZjYXRqbnB5cXFhdW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzNTI4NzIsImV4cCI6MjA1MzkyODg3Mn0.DY3Wchxz8JPWccSStpXCAKbm1KKCONKTWXVCAW5WGco';  // Replace with your Supabase anon key

// Initialize the Supabase client with the URL and anon key
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to test fetching data from the 'stocks' table
async function testSupabase() {
  const { data, error } = await supabase
    .from('stocks')  // Query the 'stocks' table
    .select('*');  // Select all rows from the table

  if (error) {
    console.error('Error:', error);  // Log any errors if they occur
  } else {
    console.log('Data retrieved:', data);  // Log the data if retrieval is successful
  }
}

// Run the function to test the connection
testSupabase();
