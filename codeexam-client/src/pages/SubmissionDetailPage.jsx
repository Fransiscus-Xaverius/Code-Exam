import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, FileText, CheckCircle, XCircle, 
  Clock, AlertTriangle, Code, Download, ExternalLink,
  ChevronDown, ChevronUp
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import API from '../components/helpers/API';
import Sidebar from '../components/Sidebar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const SubmissionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, userRole } = useSelector(state => state.auth);
  
  // State management
  const [submission, setSubmission] = useState(null);
  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [testDetailsOpen, setTestDetailsOpen] = useState({});
  const [activeTab, setActiveTab] = useState('submission'); // 'submission', 'problem'
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Determine if in desktop mode
  const isDesktop = windowWidth >= 1024; // lg breakpoint in tailwind
  
  // Set up window resize listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Fetch submission data
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setIsLoading(true);
        
        const response = await API.get(`/api/submissions/${id}`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        
        if (response.data.success) {
          const submissionData = response.data.submission;
          setSubmission(submissionData);
          setCode(submissionData.code || '');
          setLanguage(getLanguageName(submissionData.language));
          
          // Process test results if available
          if (submissionData.test_results) {
            try {
              const testResults = JSON.parse(submissionData.test_results);
              // Ensure testResults is an array
              if (Array.isArray(testResults)) {
                const initialOpenState = {};
                testResults.forEach((_, index) => {
                  initialOpenState[index] = false;
                });
                setTestDetailsOpen(initialOpenState);
              } else {
                console.error('Test results is not an array:', testResults);
              }
            } catch (e) {
              console.error('Error parsing test results:', e);
            }
          }
          
          // Fetch the problem details
          if (submissionData.problem_id) {
            fetchProblem(submissionData.problem_id);
          }
        } else {
          setError('Failed to load submission. ' + (response.data.message || ''));
        }
      } catch (err) {
        console.error('Error fetching submission:', err);
        setError('Failed to load submission. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) {
      fetchSubmission();
    } else {
      navigate('/login');
    }
  }, [id, token, navigate]);
  
  // Fetch problem details
  const fetchProblem = async (problemId) => {
    try {
      const response = await API.get(`/api/problems/${problemId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      
      if (response.data.success) {
        setProblem(response.data.problem);
      }
    } catch (err) {
      console.error('Error fetching problem details:', err);
    }
  };
  
  // Convert language ID to name
  const getLanguageName = (languageId) => {
    const languageMap = {
      '63': 'javascript',
      '71': 'python',
      '62': 'java',
      '54': 'cpp'
    };
    
    return languageMap[languageId] || 'javascript';
  };
  
  // Format language for display
  const formatLanguage = (languageId) => {
    const languageMap = {
      '63': 'JavaScript',
      '71': 'Python',
      '62': 'Java',
      '54': 'C++'
    };
    
    return languageMap[languageId] || languageId;
  };
  
  // Get status badge class and icon
  const getStatusInfo = (status) => {
    let badgeClass = '';
    let Icon = null;
    let textClass = '';
    
    switch(status) {
      case 'accepted':
        badgeClass = 'bg-green-100 text-green-800 border-green-200';
        textClass = 'text-green-800';
        Icon = CheckCircle;
        break;
      case 'pending':
      case 'processing':
      case 'judging':
        badgeClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        textClass = 'text-yellow-800';
        Icon = Clock;
        break;
      case 'wrong_answer':
        badgeClass = 'bg-red-100 text-red-800 border-red-200';
        textClass = 'text-red-800';
        Icon = XCircle;
        break;
      case 'compilation_error':
      case 'runtime_error':
      case 'time_limit_exceeded':
      case 'memory_limit_exceeded':
        badgeClass = 'bg-orange-100 text-orange-800 border-orange-200';
        textClass = 'text-orange-800';
        Icon = AlertTriangle;
        break;
      default:
        badgeClass = 'bg-gray-100 text-gray-800 border-gray-200';
        textClass = 'text-gray-800';
        Icon = FileText;
    }
    
    return { badgeClass, Icon, textClass };
  };
  
  // Format submission status for display
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    
    return status.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Toggle test details visibility
  const toggleTestDetails = (index) => {
    setTestDetailsOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Navigate back
  const handleBack = () => {
    navigate('/my-submissions');
  };
  
  // Download code
  const handleDownloadCode = () => {
    if (!submission || !submission.code) return;
    
    const fileExtension = language === 'python' ? 'py' : 
                         language === 'javascript' ? 'js' : 
                         language === 'java' ? 'java' : 
                         language === 'cpp' ? 'cpp' : 'txt';
    
    const blob = new Blob([submission.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submission-${id}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Get parsed test results if available
  const getTestResults = () => {
    if (!submission || !submission.test_results) return [];
    
    try {
      const parsed = JSON.parse(submission.test_results);
      // Ensure the parsed data is an array
      if (Array.isArray(parsed)) {
        return parsed;
      } else {
        console.error('Test results is not an array:', parsed);
        return [];
      }
    } catch (e) {
      console.error('Error parsing test results:', e);
      return [];
    }
  };
  
  const testResults = getTestResults();
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading submission details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 md:ml-64 p-6">
          <Card className="p-6 max-w-2xl mx-auto text-center">
            <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Submission</h3>
            <p className="text-red-500 mb-6">{error}</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => navigate('/my-submissions')}>
                Back to My Submissions
              </Button>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  // Render submission details
  const renderSubmissionInfo = () => {
    if (!submission) return null;
    
    const { badgeClass, Icon, textClass } = getStatusInfo(submission.status);
    
    return (
      <Card className="mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Submission Details</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex flex-col space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className={`mt-1 flex items-center ${textClass}`}>
                    {Icon && <Icon size={18} className="mr-2" />}
                    <span className="text-lg font-medium">{formatStatus(submission.status)}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Score</h3>
                  <div className="mt-1">
                    <span className="text-lg font-medium">
                      {submission.score !== null ? `${submission.score}/100` : 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Language</h3>
                  <div className="mt-1">
                    <span className="text-lg font-medium">
                      {formatLanguage(submission.language)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex flex-col space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Submitted</h3>
                  <div className="mt-1">
                    <span className="text-base">{formatDate(submission.submitted_at)}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Runtime</h3>
                  <div className="mt-1">
                    <span className="text-base">{submission.runtime_ms || '–'} ms</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Memory</h3>
                  <div className="mt-1">
                    <span className="text-base">{submission.memory_kb || '–'} KB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={handleDownloadCode}
              className="flex items-center"
            >
              <Download size={16} className="mr-2" />
              Download Code
            </Button>
            
            {problem && (
              <Button
                variant="outline"
                onClick={() => navigate(`/solve/${problem.id}`)}
                className="flex items-center"
              >
                <Code size={16} className="mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };
  
  // Render problem details
  const renderProblemDetails = () => {
    if (!problem) return null;
    
    return (
      <Card className="mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Problem Details</h2>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{problem.title}</h3>
            <div className="flex items-center space-x-3 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {problem.difficulty}
              </span>
              <span className="text-gray-500 text-sm">
                {problem.points} points
              </span>
            </div>
            
            <div className="prose max-w-none mb-6">
              <p>{problem.description}</p>
            </div>
            
            <Button
              onClick={() => navigate(`/solve/${problem.id}`)}
              className="flex items-center"
            >
              <ExternalLink size={16} className="mr-2" />
              View Full Problem
            </Button>
          </div>
        </div>
      </Card>
    );
  };
  
  // Render code editor
  const renderCodeEditor = () => {
    return (
      <Card className="mb-6">
        <div className="p-4 flex justify-between items-center border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Solution Code</h2>
          <div className="flex space-x-3">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-1"
            >
              <option value="vs-dark">Dark Theme</option>
              <option value="light">Light Theme</option>
            </select>
            
            <select
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="bg-white border border-gray-300 rounded px-3 py-1"
            >
              {[12, 14, 16, 18, 20].map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </div>
        </div>
        
        <div style={{ height: '500px' }}>
          <Editor
            height="100%"
            language={language}
            value={code}
            theme={theme}
            options={{
              fontSize: fontSize,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              readOnly: true // Read-only mode
            }}
          />
        </div>
      </Card>
    );
  };
  
  // Render test results
  const renderTestResults = () => {
    if (!testResults || testResults.length === 0) return null;
    
    const passedTests = testResults.filter(t => t.passed).length;
    
    return (
      <Card className="mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Test Results</h2>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">
                {passedTests} of {testResults.length} tests passed
              </p>
              <p className="text-sm font-medium">
                {Math.round((passedTests / testResults.length) * 100)}%
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${passedTests === testResults.length ? 'bg-green-600' : 'bg-orange-500'}`}
                style={{ width: `${(passedTests / testResults.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-4">
            {testResults.map((test, index) => (
              <div 
                key={index}
                className={`border rounded-lg overflow-hidden ${
                  test.passed ? 'border-green-200' : 'border-red-200'
                }`}
              >
                <div 
                  className={`p-4 flex justify-between items-center cursor-pointer ${
                    test.passed ? 'bg-green-50' : 'bg-red-50'
                  }`}
                  onClick={() => toggleTestDetails(index)}
                >
                  <div className="flex items-center">
                    {test.passed ? (
                      <CheckCircle className="text-green-600 mr-2" size={18} />
                    ) : (
                      <XCircle className="text-red-600 mr-2" size={18} />
                    )}
                    <span className="font-medium">
                      Test Case #{index + 1}: {test.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <div>
                    {testDetailsOpen[index] ? (
                      <ChevronUp size={18} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-500" />
                    )}
                  </div>
                </div>
                
                {testDetailsOpen[index] && (
                  <div className="p-4 border-t border-gray-200 bg-white">
                    {test.input && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Input:</h4>
                        <pre className="bg-gray-50 p-2 rounded text-sm overflow-x-auto border border-gray-200">
                          {test.input}
                        </pre>
                      </div>
                    )}
                    
                    {test.expected_output && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Expected Output:</h4>
                        <pre className="bg-gray-50 p-2 rounded text-sm overflow-x-auto border border-gray-200">
                          {test.expected_output}
                        </pre>
                      </div>
                    )}
                    
                    {test.stdout && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Actual Output:</h4>
                        <pre className={`bg-gray-50 p-2 rounded text-sm overflow-x-auto border ${
                          test.passed ? 'border-gray-200' : 'border-red-200'
                        }`}>
                          {test.stdout}
                        </pre>
                      </div>
                    )}
                    
                    {!test.passed && test.error && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Error:</h4>
                        <pre className="bg-red-50 p-2 rounded text-sm overflow-x-auto border border-red-200 text-red-800">
                          {test.error}
                        </pre>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Execution Time: {test.runtime_ms || 'N/A'}ms</span>
                      <span>Memory Usage: {test.memory_kb || 'N/A'}KB</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  };
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 py-4 sm:py-6">
          <div className="mx-auto px-4 sm:px-6 max-w-7xl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
              <div className="flex items-center mb-4 sm:mb-0">
                <button
                  onClick={handleBack}
                  className="mr-4 p-2 rounded-full hover:bg-gray-100"
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 flex items-center">
                    <FileText className="mr-2" size={20} />
                    Submission Details
                  </h1>
                  {problem && (
                    <p className="text-sm text-gray-500 mt-1">
                      {problem.title}
                    </p>
                  )}
                </div>
              </div>
              
              {submission && (
                <div className="flex items-center">
                  {(() => {
                    const { badgeClass, Icon } = getStatusInfo(submission.status);
                    return (
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center ${badgeClass}`}>
                        {Icon && <Icon size={16} className="mr-2" />}
                        {formatStatus(submission.status)}
                      </span>
                    );
                  })()}
                </div>
              )}
            </div>
            
            {/* Mobile tabs */}
            {!isDesktop && (
              <div className="flex overflow-x-auto mt-4 border-t border-gray-200 pt-4">
                <button
                  onClick={() => setActiveTab('submission')}
                  className={`px-4 py-2 mr-2 ${
                    activeTab === 'submission' 
                      ? 'text-blue-600 border-b-2 border-blue-500' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Solution
                </button>
                
                <button
                  onClick={() => setActiveTab('problem')}
                  className={`px-4 py-2 mr-2 ${
                    activeTab === 'problem' 
                      ? 'text-blue-600 border-b-2 border-blue-500' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Problem
                </button>
              </div>
            )}
          </div>
        </header>
        
        {/* Main content */}
        <main className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {isDesktop ? (
              // Desktop layout
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    {renderSubmissionInfo()}
                  </div>
                  <div className="lg:col-span-1">
                    {renderProblemDetails()}
                  </div>
                </div>
                
                {renderCodeEditor()}
                {renderTestResults()}
              </>
            ) : (
              // Mobile layout with tabs
              <>
                {activeTab === 'submission' && (
                  <>
                    {renderSubmissionInfo()}
                    {renderCodeEditor()}
                    {renderTestResults()}
                  </>
                )}
                
                {activeTab === 'problem' && (
                  <>
                    {renderProblemDetails()}
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SubmissionDetailsPage;