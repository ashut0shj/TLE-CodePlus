const axios = require('axios');

// Test heatmap endpoint
const testHeatmap = async () => {
  try {
    // First, get a list of students to find one to test with
    const studentsResponse = await axios.get('http://localhost:5000/api/students');
    const students = studentsResponse.data;
    
    if (students.length === 0) {
      console.log('No students found. Please add a student first.');
      return;
    }
    
    const testStudent = students[0];
    console.log(`Testing heatmap for student: ${testStudent.name} (${testStudent.email})`);
    
    // Test the heatmap endpoint
    const response = await axios.get(`http://localhost:5000/api/students/${testStudent._id}/heatmap?days=365`);
    
    console.log('Heatmap test successful!');
    console.log('Number of data points:', response.data.length);
    console.log('Sample data points:');
    response.data.slice(0, 5).forEach(item => {
      console.log(`  ${item.date}: ${item.count} problems`);
    });
    
  } catch (error) {
    console.error('Error testing heatmap:', error.response?.data || error.message);
  }
};

testHeatmap(); 