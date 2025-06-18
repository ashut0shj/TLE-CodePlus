const axios = require('axios');

// Test problem data filtering
const testProblemFiltering = async () => {
  try {
    // First, get a list of students to find one to test with
    const studentsResponse = await axios.get('http://localhost:5000/api/students');
    const students = studentsResponse.data;
    
    if (students.length === 0) {
      console.log('No students found. Please add a student first.');
      return;
    }
    
    const testStudent = students[0];
    console.log(`Testing problem filtering for student: ${testStudent.name} (${testStudent.email})`);
    
    // Test different day ranges
    const dayRanges = [7, 30, 90, 365];
    
    for (const days of dayRanges) {
      console.log(`\n--- Testing ${days} days filter ---`);
      
      const response = await axios.get(`http://localhost:5000/api/students/${testStudent._id}/problems?days=${days}`);
      const data = response.data;
      
      console.log(`Total problems: ${data.statistics.totalProblems}`);
      console.log(`Average rating: ${data.statistics.averageRating}`);
      console.log(`Average problems per day: ${data.statistics.averageProblemsPerDay}`);
      
      if (data.statistics.mostDifficultProblem) {
        console.log(`Most difficult problem: ${data.statistics.mostDifficultProblem.problemName} (Rating: ${data.statistics.mostDifficultProblem.rating})`);
      } else {
        console.log('Most difficult problem: None');
      }
      
      console.log('Rating buckets:', data.statistics.ratingBuckets);
    }
    
  } catch (error) {
    console.error('Error testing problem filtering:', error.response?.data || error.message);
  }
};

testProblemFiltering(); 