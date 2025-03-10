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

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    try {
      // This would connect to your Judge0 or similar API
      // For demo purposes, we'll simulate an API call
      setTimeout(() => {
        setOutput('Program executed successfully!\n> Hello, CodeExam!');
        setIsRunning(false);
      }, 1000);
      
      // Actual API integration would look like:
      /*
      const token = localStorage.getItem('codeexam_token');
      const response = await axios.post('/api/submissions/run', {
        problem_id: id,
        source_code: code,
        language_id: getLanguageId(language)
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      setOutput(response.data.output || response.data.error || 'Execution complete.');
      */
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const submitSolution = async () => {
    try {
      setIsRunning(true);
      setOutput('Submitting solution...');
      
      // Actual submission API call would look like:
      /*
      const token = localStorage.getItem('codeexam_token');
      const response = await axios.post('/api/submissions', {
        problem_id: id,
        source_code: code,
        language_id: getLanguageId(language)
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      setOutput(`Submission result: ${response.data.status}\n${response.data.message || ''}`);
      */
      
      // Demo simulation
      setTimeout(() => {
        setOutput('Submission successful!\nAll test cases passed. Score: 100/100');
        setIsRunning(false);
      }, 2000);
    } catch (error) {
      setOutput(`Submission error: ${error.message}`);
    } finally {
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
            <div>
              <button 
                className={`px-4 py-1 rounded font-medium ${isRunning ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'}`}
                onClick={runCode}
                disabled={isRunning}
              >
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
              <button 
                className={`ml-2 px-4 py-1 rounded font-medium ${isRunning ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                onClick={submitSolution}
                disabled={isRunning}
              >
                {isRunning ? 'Processing...' : 'Submit'}
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
          <div className="h-40 bg-gray-200 p-3 overflow-y-auto">
            <h3 className="text-lg font-medium mb-2">Console Output</h3>
            <pre className="bg-white p-3 rounded h-24 overflow-y-auto">
              {output || 'Run your code to see output here'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolvePage;