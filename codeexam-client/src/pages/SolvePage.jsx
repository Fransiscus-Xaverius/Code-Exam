import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const SolvePage = () => {
  const { id } = useParams();
  const [code, setCode] = useState('// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch problem details using the ID
    const fetchProblemDetails = async () => {
      try {
        setIsLoading(true);
        // Get token from localStorage
        const token = localStorage.getItem('codeexam_token');
        
        // Make API request with authorization header
        const response = await axios.get(`/api/problems/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        });
        
        // Set problem from response
        setProblem(response.data.problem);
        setError(null);
      } catch (err) {
        console.error(`Error fetching problem with ID ${id}:`, err);
        setError('Failed to load problem details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProblemDetails();
  }, [id]);

  // Check submission status if we have a submission ID
  useEffect(() => {
    if (!submissionId) return;

    const checkSubmissionStatus = async () => {
      try {
        const token = localStorage.getItem('codeexam_token');
        const response = await axios.get(`/api/submissions/${submissionId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        });

        setSubmissionStatus(response.data.submission.status);
        
        // If the submission is still processing, check again in 2 seconds
        if (response.data.submission.status === 'pending' || response.data.submission.status === 'processing') {
          setTimeout(() => checkSubmissionStatus(), 2000);
        } else {
          // Update output with the submission results
          const status = response.data.submission.status;
          const score = response.data.submission.score;
          const runtime = response.data.submission.runtime_ms;
          const memory = response.data.submission.memory_kb;
          
          let resultMessage = `Submission ${status}\n`;
          resultMessage += `Score: ${score}/100\n`;
          resultMessage += `Runtime: ${runtime}ms\n`;
          resultMessage += `Memory: ${memory}KB\n\n`;
          
          if (response.data.submission.error_message) {
            resultMessage += `Error: ${response.data.submission.error_message}\n\n`;
          }
          
          // If there are test results, display them
          if (response.data.submission.test_results) {
            try {
              const testResults = JSON.parse(response.data.submission.test_results);
              resultMessage += "Test Results:\n";
              testResults.forEach((result, index) => {
                resultMessage += `Test #${index + 1}: ${result.passed ? 'PASSED' : 'FAILED'}\n`;
                if (!result.passed && result.error) {
                  resultMessage += `  Error: ${result.error}\n`;
                }
              });
            } catch (e) {
              resultMessage += "Test results available in submission details.";
            }
          }
          
          setOutput(resultMessage);
          setIsRunning(false);
        }
      } catch (error) {
        console.error('Error checking submission status:', error);
        setOutput(`Error checking submission status: ${error.message}`);
        setIsRunning(false);
      }
    };

    checkSubmissionStatus();
  }, [submissionId]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('codeexam_token');
      
      // Make API request to run the code
      const response = await axios.post('/api/submissions/run', {
        problem_id: id,
        source_code: code,
        language_id: getLanguageId(language)
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      // Format the results for display
      let resultOutput = 'Code execution complete.\n\n';
      
      if (response.data.results && response.data.results.length > 0) {
        resultOutput += 'Test Results:\n';
        response.data.results.forEach((result, index) => {
          resultOutput += `Test #${index + 1}: ${result.passed ? 'PASSED' : 'FAILED'}\n`;
          resultOutput += `  Input: ${result.input}\n`;
          resultOutput += `  Expected: ${result.expected_output}\n`;
          resultOutput += `  Actual: ${result.actual_output}\n`;
          resultOutput += `  Runtime: ${result.runtime_ms}ms\n`;
          resultOutput += `  Memory: ${result.memory_kb}KB\n\n`;
        });
      } else {
        resultOutput += response.data.message || 'No test results available.';
      }
      
      setOutput(resultOutput);
    } catch (error) {
      console.error('Error running code:', error);
      setOutput(`Error running code: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const submitSolution = async () => {
    try {
      setIsRunning(true);
      setOutput('Submitting solution...');
      setSubmissionId(null);
      setSubmissionStatus(null);
      
      // Get token from localStorage
      const token = localStorage.getItem('codeexam_token');
      
      // Make API request to submit the solution
      const response = await axios.post('/api/submissions', {
        problem_id: id,
        code: code,
        language: language
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      setOutput(`Submission received and queued for evaluation. Submission ID: ${response.data.submission_id}`);
      
      // Store the submission ID to check its status
      setSubmissionId(response.data.submission_id);
      setSubmissionStatus('pending');
      
    } catch (error) {
      console.error('Error submitting solution:', error);
      setOutput(`Submission error: ${error.response?.data?.message || error.message}`);
      setIsRunning(false);
    }
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  // Helper function to get language ID for Judge0 API
  const getLanguageId = (lang) => {
    const languageMap = {
      'javascript': 63,  // Node.js
      'python': 71,     // Python 3
      'java': 62,       // Java
      'cpp': 54,        // C++
    };
    return languageMap[lang] || 63; // Default to JavaScript/Node.js
  };

  // Helper function to get status badge color
  const getStatusBadgeColor = (status) => {
    const statusColorMap = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'error': 'bg-red-100 text-red-800'
    };
    return statusColorMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-4">
            <button className="px-3 py-1 rounded hover:bg-gray-600" onClick={() => navigate('/dashboard')}>Problem List</button>
            <button className="px-3 py-1 rounded hover:bg-gray-600">Solutions</button>
            <button className="px-3 py-1 rounded hover:bg-gray-600">Profile</button>
          </div>
          <div className="text-xl font-bold">CodeExam</div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question Panel */}
        <div className="w-1/3 bg-gray-200 overflow-y-auto p-6 border-r border-gray-300">
          <h2 className="text-2xl font-bold mb-4">Question Details</h2>
          
          {isLoading ? (
            <div className="bg-white p-4 rounded-lg shadow">
              <p>Loading problem details...</p>
            </div>
          ) : error ? (
            <div className="bg-white p-4 rounded-lg shadow text-red-500">
              <p>{error}</p>
            </div>
          ) : problem ? (
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">{problem.title}</h3>
              <div className="mb-4">
                <span className={`inline-block px-2 py-1 rounded text-sm mr-2 ${
                  problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                  problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>{problem.difficulty}</span>
                <span className="text-gray-500 text-sm">Points: {problem.points}</span>
              </div>
              <p className="mb-4">{problem.description}</p>
              
              <h4 className="font-semibold mb-2">Input Format:</h4>
              <pre className="bg-gray-100 p-3 rounded mb-4 whitespace-pre-wrap">
                {problem.input_format}
              </pre>
              
              <h4 className="font-semibold mb-2">Output Format:</h4>
              <pre className="bg-gray-100 p-3 rounded mb-4 whitespace-pre-wrap">
                {problem.output_format}
              </pre>
              
              <h4 className="font-semibold mb-2">Sample Input:</h4>
              <pre className="bg-gray-100 p-3 rounded mb-4 whitespace-pre-wrap">
                {problem.sample_input}
              </pre>
              
              <h4 className="font-semibold mb-2">Sample Output:</h4>
              <pre className="bg-gray-100 p-3 rounded mb-4 whitespace-pre-wrap">
                {problem.sample_output}
              </pre>
              
              <h4 className="font-semibold mb-2">Constraints:</h4>
              <pre className="bg-gray-100 p-3 rounded mb-4 whitespace-pre-wrap">
                {problem.constraints}
              </pre>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Time Limit: {problem.time_limit_ms}ms</p>
                <p>Memory Limit: {problem.memory_limit_kb}KB</p>
                <p>Created by: {problem.creator?.username}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow">
              <p>Problem not found</p>
            </div>
          )}
        </div>

        {/* Code Editor and Console */}
        <div className="flex flex-col flex-1">
          {/* Editor Controls */}
          <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <select 
                className="bg-gray-700 text-white px-3 py-1 rounded"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              <select 
                className="bg-gray-700 text-white px-3 py-1 rounded"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="vs-dark">Dark</option>
                <option value="light">Light</option>
              </select>
              <select 
                className="bg-gray-700 text-white px-3 py-1 rounded"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
              >
                {[12, 14, 16, 18, 20].map(size => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              {submissionStatus && (
                <span className={`px-2 py-1 rounded text-sm ${getStatusBadgeColor(submissionStatus)}`}>
                  Status: {submissionStatus}
                </span>
              )}
              <button 
                className={`px-4 py-1 rounded font-medium ${isRunning ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'}`}
                onClick={runCode}
                disabled={isRunning}
              >
                {isRunning && submissionStatus !== 'pending' && submissionStatus !== 'processing' ? 'Running...' : 'Run Code'}
              </button>
              <button 
                className={`ml-2 px-4 py-1 rounded font-medium ${isRunning ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                onClick={submitSolution}
                disabled={isRunning}
              >
                {isRunning && (submissionStatus === 'pending' || submissionStatus === 'processing') ? 'Processing...' : 'Submit'}
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language}
              value={code}
              theme={theme}
              onChange={handleEditorChange}
              options={{
                fontSize: fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on'
              }}
            />
          </div>

          {/* Console Output */}
          <div className="h-48 bg-gray-200 p-3 overflow-y-auto">
            <h3 className="text-lg font-medium mb-2">Console Output</h3>
            <pre className="bg-white p-3 rounded h-32 overflow-y-auto">
              {output || 'Run your code to see output here'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolvePage;