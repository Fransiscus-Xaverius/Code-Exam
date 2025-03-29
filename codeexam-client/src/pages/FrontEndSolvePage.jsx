import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API from '../components/helpers/API';

/*

    THIS PAGE IS SIMILAR TO SOLVEPAGE.JSX BUT FOR FRONTEND CODING PROBLEMS.
    -FX
    
*/
const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={() => onOpenChange(false)}
      ></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children }) => (
  <div className="p-6">{children}</div>
);

const DialogHeader = ({ children }) => (
  <div className="border-b pb-4 mb-4">{children}</div>
);

const DialogTitle = ({ children }) => (
  <h2 className="text-xl font-semibold">{children}</h2>
);

const DialogDescription = ({ children }) => (
  <p className="text-gray-500 text-sm">{children}</p>
);

const Input = ({ value, onChange, placeholder, className, id, type = 'text' }) => (
  <input
    type={type}
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

const Textarea = ({ value, onChange, placeholder, className, id }) => (
  <textarea
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

const Button = ({ children, onClick, disabled, className, variant = 'primary' }) => {
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md transition-colors ${variantStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Label = ({ children, htmlFor, className }) => (
  <label
    htmlFor={htmlFor}
    className={`block text-sm font-medium text-gray-700 ${className}`}
  >
    {children}
  </label>
);

const FrontendSolvePage = () => {
  const { id } = useParams();
  const [code, setCode] = useState('<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Frontend Challenge</title>\n  <style>\n    /* Add your CSS here */\n    body {\n      font-family: Arial, sans-serif;\n      margin: 0;\n      padding: 20px;\n    }\n  </style>\n</head>\n<body>\n  <!-- Add your HTML here -->\n  <h1>Hello World</h1>\n  \n  <script>\n    // Add your JavaScript here\n    document.addEventListener("DOMContentLoaded", function() {\n      console.log("Page loaded!");\n    });\n  </script>\n</body>\n</html>');
  
  const [language, setLanguage] = useState('html');
  const [theme, setTheme] = useState('vs-dark');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  
  // New state for preview mode
  const [previewMode, setPreviewMode] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [submissionTitle, setSubmissionTitle] = useState('');
  const [submissionExplanation, setSubmissionExplanation] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblemDetails = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('codeexam_token');

        const response = await API.get(`/api/frontend-problems/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        });

        setProblem(response.data.problem);
        
        // If the problem comes with starter code, use it
        if (response.data.problem?.starter_code) {
          setCode(response.data.problem.starter_code);
        }
        
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

  useEffect(() => {
    if (!submissionId) return;

    const checkSubmissionStatus = async () => {
      try {
        const token = localStorage.getItem('codeexam_token');
        const response = await API.get(`/api/submissions/${submissionId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        });

        setSubmissionStatus(response.data.submission.status);

        if (response.data.submission.status === 'pending' || response.data.submission.status === 'processing') {
          setTimeout(() => checkSubmissionStatus(), 10);
        } else {
          const status = response.data.submission.status;
          const score = response.data.submission.score;

          let resultMessage = `Submission ${status}\n`;
          resultMessage += `Score: ${score}/100\n\n`;

          if (response.data.submission.error_message) {
            resultMessage += `Error: ${response.data.submission.error_message}\n\n`;
          }

          if (response.data.submission.test_results) {
            try {
              const testResults = JSON.parse(response.data.submission.test_results);
              resultMessage += "Test Results:\n";
              testResults.forEach((result, index) => {
                resultMessage += `Test #${index + 1}: ${result.passed ? 'PASSED' : 'FAILED'}\n`;
                if (!result.passed && result.error) {
                  resultMessage += `  Error: ${result.error}\n`;
                }
                if (result.screenshot_url) {
                  resultMessage += `  Screenshot: ${result.screenshot_url}\n`;
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

  const postPublicSubmission = async () => {
    try {
      setIsRunning(true);
      const token = localStorage.getItem('codeexam_token');

      const updateRes = await API.put(`/api/submissions/${submissionId}/publish`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      const publicRes = await API.post(`/api/discussions/${submissionId}`, {
        submission_id: submissionId,
        problem_id: id,
        title: submissionTitle,
        content: submissionExplanation
      }, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      setIsSubmissionModalOpen(false);
    } catch (error) {
      console.error('Error processing submission:', error);
      setOutput(`Error processing submission: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const previewCode = () => {
    setPreviewContent(code);
    // Toggle preview mode
    setPreviewMode(!previewMode);
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    try {
      // For frontend problems, we can just update the preview
      setPreviewContent(code);
      setPreviewMode(true);
      
      // Check for console.log messages
      let outputMessages = '';
      
      // Since we're using an iframe for preview, we can capture console logs
      // by injecting a script that overrides console methods
      const consoleLogCapture = `
      <script>
        (function() {
          let logs = [];
          const originalConsoleLog = console.log;
          console.log = function() {
            logs.push(Array.from(arguments).join(' '));
            originalConsoleLog.apply(console, arguments);
            window.parent.postMessage({type: 'console', logs: logs}, '*');
          };
          
          const originalConsoleError = console.error;
          console.error = function() {
            logs.push('ERROR: ' + Array.from(arguments).join(' '));
            originalConsoleError.apply(console, arguments);
            window.parent.postMessage({type: 'console', logs: logs}, '*');
          };
          
          const originalConsoleWarn = console.warn;
          console.warn = function() {
            logs.push('WARNING: ' + Array.from(arguments).join(' '));
            originalConsoleWarn.apply(console, arguments);
            window.parent.postMessage({type: 'console', logs: logs}, '*');
          };
          
          window.onerror = function(message, source, lineno, colno, error) {
            logs.push('RUNTIME ERROR: ' + message + ' at line ' + lineno + ':' + colno);
            window.parent.postMessage({type: 'console', logs: logs}, '*');
            return true;
          };
        })();
      </script>
      `;
      
      // Add the console capture script to the preview content
      const modifiedCode = code.replace('</head>', `${consoleLogCapture}</head>`);
      setPreviewContent(modifiedCode);
      
      // We'll set up a listener for messages from the iframe in useEffect
      
      setOutput('Code running in preview. Check console output below.');
      setIsRunning(false);
    } catch (error) {
      console.error('Error running code:', error);
      setOutput(`Error running code: ${error.message}`);
      setIsRunning(false);
    }
  };

  // Set up listener for console messages from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'console') {
        setOutput('Console Output:\n' + event.data.logs.join('\n'));
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const submitSolution = async () => {
    try {
      setIsRunning(true);
      setOutput('Submitting solution...');
      setSubmissionId(null);
      setSubmissionStatus(null);

      const token = localStorage.getItem('codeexam_token');

      const response = await API.post('/api/frontend-submissions', {
        problem_id: id,
        code: code,
        language: language
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      setOutput(`Submission received and queued for evaluation. Submission ID: ${response.data.submission_id}`);

      setSubmissionId(response.data.submission.id);
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

  const openSubmissionModal = () => {
    setSubmissionTitle('');
    setSubmissionExplanation('');
    setIsSubmissionModalOpen(true);
  };

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
      {/* Submission Modal */}
      <Dialog open={isSubmissionModalOpen} onOpenChange={setIsSubmissionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Solution</DialogTitle>
            <DialogDescription>
              Provide a title and explanation for your submitted solution.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={submissionTitle}
                onChange={(e) => setSubmissionTitle(e.target.value)}
                placeholder="Give your solution a descriptive title"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="explanation" className="text-right">
                Explanation
              </Label>
              <Textarea
                id="explanation"
                value={submissionExplanation}
                onChange={(e) => setSubmissionExplanation(e.target.value)}
                placeholder="Explain your solution approach, key techniques, or interesting CSS/JS features used"
                className="col-span-3 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Submitted Code</Label>
              <div className="col-span-3 bg-gray-100 p-2 rounded max-h-[200px] overflow-y-auto">
                <pre className="text-xs">{code}</pre>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsSubmissionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={postPublicSubmission}
              disabled={!submissionTitle.trim() || isRunning}
            >
              {isRunning ? 'Posting...' : 'Post Solution'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <nav className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-4">
            <button className="px-3 py-1 rounded hover:bg-gray-600" onClick={() => navigate('/dashboard')}>Problem List</button>
            <button className="px-3 py-1 rounded hover:bg-gray-600">Solutions</button>
            <button className="px-3 py-1 rounded hover:bg-gray-600">Profile</button>
          </div>
          <div className="text-xl font-bold">Frontend CodeExam</div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 bg-gray-200 overflow-y-auto p-6 border-r border-gray-300">
          <h2 className="text-2xl font-bold mb-4">Frontend Challenge</h2>

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
                <span className={`inline-block px-2 py-1 rounded text-sm mr-2 ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                  }`}>{problem.difficulty}</span>
                <span className="text-gray-500 text-sm">Points: {problem.points}</span>
              </div>
              
              <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: problem.description }}></div>

              <h4 className="font-semibold mb-2">Requirements:</h4>
              <ul className="list-disc pl-5 mb-4">
                {problem.requirements?.map((req, index) => (
                  <li key={index} className="mb-1">{req}</li>
                ))}
              </ul>

              {problem.expected_design && (
                <>
                  <h4 className="font-semibold mb-2">Expected Design:</h4>
                  <div className="mb-4">
                    <img 
                      src={problem.expected_design} 
                      alt="Expected design" 
                      className="w-full border border-gray-300 rounded"
                    />
                  </div>
                </>
              )}

              <h4 className="font-semibold mb-2">Test Criteria:</h4>
              <ul className="list-disc pl-5 mb-4">
                {problem.test_criteria?.map((criteria, index) => (
                  <li key={index} className="mb-1">{criteria}</li>
                ))}
              </ul>

              <div className="mt-4 text-sm text-gray-500">
                <p>Created by: {problem.creator?.username}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow">
              <p>Problem not found</p>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1">
          <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <select
                className="bg-gray-700 text-white px-3 py-1 rounded"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="javascript">JavaScript</option>
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
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
              <button
                className={`px-4 py-1 rounded font-medium ${previewMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                onClick={previewCode}
              >
                {previewMode ? 'Show Editor' : 'Show Preview'}
              </button>
              <button
                className={`ml-2 px-4 py-1 rounded font-medium ${isRunning ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                onClick={submitSolution}
                disabled={isRunning}
              >
                {isRunning && (submissionStatus === 'pending' || submissionStatus === 'processing') ? 'Processing...' : 'Submit'}
              </button>

              {submissionStatus === 'accepted' && (
                <button
                  className={`ml-2 px-4 py-1 rounded font-medium ${isRunning ? 'bg-gray-600' : 'bg-purple-600 hover:bg-purple-700'}`}
                  onClick={openSubmissionModal}
                  disabled={isRunning}
                >
                  {isRunning ? 'Posting...' : 'Post Publicly'}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {previewMode ? (
              <div className="h-full bg-white p-2 overflow-hidden">
                <iframe
                  title="Preview"
                  srcDoc={previewContent}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                ></iframe>
              </div>
            ) : (
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
            )}
          </div>

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

export default FrontendSolvePage;