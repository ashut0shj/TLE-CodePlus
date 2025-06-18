const axios = require('axios');

// Test manual reminder endpoint
const testManualReminder = async () => {
  try {
    // First, get a list of students to find one to test with
    const studentsResponse = await axios.get('http://localhost:5000/api/students');
    const students = studentsResponse.data;
    
    if (students.length === 0) {
      console.log('No students found. Please add a student first.');
      return;
    }
    
    const testStudent = students[0];
    console.log(`Testing manual reminder for student: ${testStudent.name} (${testStudent.email})`);
    
    // Test the manual reminder endpoint
    const response = await axios.post(`http://localhost:5000/api/students/${testStudent._id}/send-reminder`);
    
    console.log('Manual reminder test successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('Error testing manual reminder:', error.response?.data || error.message);
  }
};

testManualReminder(); 