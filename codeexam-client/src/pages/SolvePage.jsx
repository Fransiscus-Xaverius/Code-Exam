import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, Code, Check, X, AlertTriangle, 
  MessageSquare, Award, FileText, Save, Clock,
  Download, ExternalLink, ChevronRight, ChevronDown, ChevronUp
} from 'lucide-react';
import API from '../components/helpers/API';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

// Common UI components
const Button = ({ children, onClick, disabled, className, variant = 'primary', size = 'md' }) => {
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    success: 'bg-green-600 text-white hover:bg-green-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100'
  };
  
  const sizeStyles = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-5 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md transition-colors ${variantStyles[variant]} ${sizeStyles[size]} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const SolvePage = () => {
  const { id } = useParams(); // Submission ID if reviewing, Problem ID if solving
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'solve'; // 'solve' or 'review'
  const competitionId = searchParams.get('competition');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, token, user } = useSelector(state => state.auth);
  
  // State for current problem and submission
  const [code, setCode] = useState('// Write your code here\n');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [problem, setProblem] = useState(null);
  const [submission, setSubmission] = useState(null);
  
  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('code'); // 'code', 'details', 'review'
  const [testDetailsOpen, setTestDetailsOpen] = useState({});
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Judge Review State
  const [judgeScore, setJudgeScore] = useState(0);
  const [judgeComment, setJudgeComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Determine if in review mode
  const isReviewMode = mode === 'review' && (userRole === 'admin' || userRole === 'judge');
  
  // Responsive layout breakpoint
  const isDesktop = windowWidth >= 1024; // lg breakpoint in tailwind

  const [submissionId, setSubmissionId] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [runCodeSubmissionId, setRunCodeSubmissionId] = useState(null);
  const [runCodeStatus, setRunCodeStatus] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(2000); // 2 seconds initial polling

  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [submissionTitle, setSubmissionTitle] = useState('');
  const [submissionExplanation, setSubmissionExplanation] = useState('');

// Helper function to convert language name to ID
const getLanguageId = (lang) => {
  const languageMap = {
    'javascript': 63,
    'python': 71,
    'java': 62,
    'cpp': 54,
  };
  return languageMap[lang] || 63;
};

const openSubmissionModal = () => {
    setSubmissionTitle('');
    setSubmissionExplanation('');
    setIsSubmissionModalOpen(true);
};

// Run code functionality
const runCode = async () => {
  setIsRunning(true);
  setOutput('Running code...');
  setRunCodeSubmissionId(null);
  setRunCodeStatus(null);

  try {
    const token = localStorage.getItem('codeexam_token');
    
    // Include competition_id in the request if available
    const payload = {
      problem_id: id,
      code: code,
      language: getLanguageId(language)
    };
  

    const response = await API.post('/api/submissions/run-code', payload, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });

    // Set the submission ID to trigger the polling effect
    setRunCodeSubmissionId(response.data.submission.id);
    setRunCodeStatus('pending');
    setOutput('Code submitted for execution. Waiting for results...');
    
  } catch (error) {
    console.error('Error running code:', error);
    setOutput(`Error running code: ${error.response?.data?.message || error.message}`);
    setIsRunning(false);
  }
};

// Add this effect to poll for run code status
useEffect(() => {
  if (runCodeSubmissionId) {
    checkRunCodeStatus();
  }
}, [runCodeSubmissionId]);

// Check run code status function
const checkRunCodeStatus = async () => {
  try {
    const token = localStorage.getItem('codeexam_token');
    const response = await API.get(`/api/submissions/${runCodeSubmissionId}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });

    setRunCodeStatus(response.data.submission.status);

    if (response.data.submission.status === 'pending' || response.data.submission.status === 'processing' || response.data.submission.status === 'judging') {
      setTimeout(() => checkRunCodeStatus(), 10);
    } else {
      console.log(response.data.submission.status)
      console.log(response.data)
      // Process completed results
      const status = response.data.submission.status;
      const runtime = response.data.submission.execution_time_ms || response.data.submission.runtime_ms;
      const memory = response.data.submission.memory_used_kb || response.data.submission.memory_kb;

      let resultOutput = 'Code execution complete.\n\n';

      if (status !== 'accepted' && response.data.submission.error_message) {
        resultOutput += `Error: ${response.data.submission.error_message}\n\n`;
      }

      if (response.data.submission.test_results) {
        try {
          const testResults = JSON.parse(response.data.submission.test_results);
          resultOutput += 'Test Results:\n';
          console.log(response.data.submission.compile_error)
          testResults.forEach((result, index) => {
            resultOutput += `Test #${index + 1}: ${result.passed ? 'PASSED' : 'FAILED'}\n`;
            if (result.input) resultOutput += `  Input: ${result.input}\n`;
            if (result.expected_output) resultOutput += `  Expected: ${result.expected_output}\n`;
            if (result.stdout) resultOutput += `  Actual: ${result.stdout}\n`;
            resultOutput += `  Runtime: ${result.runtime_ms}ms\n`;
            resultOutput += `  Memory: ${result.memory_kb}KB\n`;
            if (!result.passed && result.error) {
              resultOutput += `  Error: ${result.error}\n`;
            }
            if(response.data.submission.compile_error) {
              resultOutput += `  Compile Error: ${response.data.submission.compile_error}\n`;
            }
            resultOutput += '\n';
          });
        } catch (e) {
          resultOutput += "Test results format error. Please try again.\n";
          console.error("Error parsing test results:", e);
        }
      } else {
        resultOutput += response.data.message || 'No test results available.';
      }

      setOutput(resultOutput);
      setIsRunning(false);
      setRunCodeSubmissionId(null);
    }
  } catch (error) {
    console.error('Error checking run-code status:', error);
    setOutput(`Error checking run-code status: ${error.response?.data?.message || error.message}`);
    setIsRunning(false);
    setRunCodeSubmissionId(null);
  }
};

// Submit solution functionality
const submitSolution = async () => {
  try {
    setIsRunning(true);
    setOutput('Submitting solution...');
    setSubmissionId(null);
    setSubmissionStatus(null);

    const token = localStorage.getItem('codeexam_token');

    // Include competition_id in the request if available
    const response = await API.post('/api/submissions/submit', {
      problem_id: id,
      code: code,
      language: getLanguageId(language),
      competition_id: competitionId // Include competition_id if available
    }, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });

    setOutput(`Submission received and queued for evaluation. Submission ID: ${response.data.submission?.id || 'Unknown'}`);

    setSubmissionId(response.data.submission?.id);
    setSubmissionStatus('pending');
  } catch (error) {
    console.error('Error submitting solution:', error);
    setOutput(`Submission error: ${error.response?.data?.message || error.message}`);
    setIsRunning(false);
  }
};

// Add this effect to check submission status
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

      if (response.data.submission.status === 'pending' || response.data.submission.status === 'processing' || response.data.submission.status === 'judging') {
        setTimeout(() => checkSubmissionStatus(), 1000);
      } else {
        console.log('kontol', response.data)
        const status = response.data.submission.status;
        const score = response.data.submission.score;
        const testResults = response.data.submission.test_results ? JSON.parse(response.data.submission.test_results) : [];
        const runtime = testResults.length > 0 
          ? Math.round(testResults.reduce((sum, test) => sum + test.runtime_ms, 0) / testResults.length * 1000) / 1000
          : response.data.submission.runtime_ms || 0;
        const memory = testResults.length > 0 
          ? Math.round(testResults.reduce((sum, test) => sum + test.memory_kb, 0) / testResults.length)
          : response.data.submission.memory_kb || 0;

        let resultMessage = `Submission ${status}\n`;
        resultMessage += `Score: ${score}/100\n`;
        resultMessage += `Average Runtime: ${runtime}ms\n`;
        resultMessage += `Average Memory Usage: ${memory}KB\n\n`;

        if (response.data.submission.error_message) {
          resultMessage += `Error: ${response.data.submission.error_message}\n\n`;
        }

        if (response.data.submission.test_results) {
          try {
            const testResults = JSON.parse(response.data.submission.test_results);
            console.log("KONTOLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL", response.data.submission.compile_error)
            resultMessage += "Test Results:\n";
            testResults.forEach((result, index) => {
              resultMessage += `Test #${index + 1}: ${result.passed ? 'PASSED' : 'FAILED'}\n`;
              if (!result.passed && result.error) {
                resultMessage += `  Error: ${result.error}\n`;
              } 
              if(response.data.submission.compile_error) {
                resultMessage += `  Compile Error: ${response.data.submission.compile_error}\n`;
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

  // Window resize listener
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Load data based on the mode
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        if (isReviewMode) {
          // In review mode, we're loading a submission
          await fetchSubmission(id);
          
        } else {
          // In solve mode, we're loading a problem
          await fetchProblem(id);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, mode, token]);
  
  // Fetch a specific submission
  const fetchSubmission = async (submissionId) => {
    try {
      const response = await API.get(`/api/submissions/${submissionId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      
      if (response.data.success) {
        const submissionData = response.data.submission;
        console.log(response)
        setSubmission(submissionData);
        setCode(submissionData.code);
        setLanguage(submissionData.language);
        
        // Set review values if they exist
        if (submissionData.score !== undefined) {
          setJudgeScore(submissionData.score);
        }
        
        if (submissionData.judge_comment) {
          setJudgeComment(submissionData.judge_comment);
        }
        
        // Process test results if available
        if (submissionData.test_results) {
          try {
            const testResults = JSON.parse(submissionData.test_results);
            // Initialize which test details are open
            const initialOpenState = {};
            testResults.forEach((_, index) => {
              initialOpenState[index] = false;
            });
            setTestDetailsOpen(initialOpenState);
            
            // Format test results for output
            let resultOutput = 'Test Results:\n';
            testResults.forEach((result, index) => {
              resultOutput += `Test #${index + 1}: ${result.passed ? 'PASSED' : 'FAILED'}\n`;
              if (!result.passed && result.error) {
                resultOutput += `  Error: ${result.error}\n`;
              }
            });
            setOutput(resultOutput);
          } catch (e) {
            console.error('Error parsing test results:', e);
          }
        }
        
        // Also fetch the problem associated with this submission
        await fetchProblem(submissionData.problem_id);
      } else {
        setError('Failed to load submission. ' + (response.data.message || ''));
      }
    } catch (err) {
      console.error('Error fetching submission:', err);
      throw err;
    }

  };
  
  // Fetch a problem
  const fetchProblem = async (problemId) => {
    try {
      const response = await API.get(`/api/problems/${problemId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      
      if (response.data.success) {
        setProblem(response.data.problem);
      } else {
        setError('Failed to load problem. ' + (response.data.message || ''));
      }
    } catch (err) {
      console.error('Error fetching problem:', err);
      throw err;
    }
  };
  
  // Handle judge review submission
  const handleReviewSubmit = async () => {
    if (!submission || !token) return;
    
    try {
      setIsSaving(true);
      
      const response = await API.put(
        `/api/submissions/${submission.id}/judge`,
        {
          status: judgeScore >= 60 ? 'accepted' : 'wrong_answer',
          score: judgeScore,
          judge_comment: judgeComment
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setSaveSuccess(true);
        
        // Update the submission object
        setSubmission(prev => ({
          ...prev,
          status: judgeScore >= 60 ? 'accepted' : 'wrong_answer',
          score: judgeScore,
          judge_comment: judgeComment,
          judge_id: user.id,
          judged_at: new Date().toISOString()
        }));
        
        // Show success message briefly
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        setError('Failed to save review: ' + (response.data.message || ''));
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to save review. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
    // If there's a previous page in the history, go back
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Otherwise, fallback to the competition page or submissions page
      if (competitionId) {
        navigate(`/competitions/${competitionId}/submissions`);
      } else {
        navigate('/submissions');
      }
    }
  };
  
  // Format a date string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Loading...</p>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-lg w-full">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <Button 
          onClick={handleBack}
          variant="primary"
        >
          Go Back
        </Button>
      </div>
    );
  }
  
  // Get parsed test results if available
  const getTestResults = () => {
    if (!submission || !submission.test_results) return [];
    
    try {
      return JSON.parse(submission.test_results);
    } catch (e) {
      console.error('Error parsing test results:', e);
      return [];
    }
  };
  
  const testResults = getTestResults();

  // Render Problem Details
  const renderProblemDetails = () => {
    if (!problem) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <h2 className="text-lg font-medium">Problem Details</h2>
        </div>
        
        <div className="p-6 overflow-y-auto" style={{ maxHeight: isDesktop ? 'calc(100vh - 170px)' : '70vh' }}>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{problem.title}</h3>
            <div className="flex items-center mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${
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
            
            {problem.input_format && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Input Format:</h4>
                <pre className="bg-gray-50 p-3 rounded-md border border-gray-200 whitespace-pre-wrap">
                  {problem.input_format}
                </pre>
              </div>
            )}
            
            {problem.output_format && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Output Format:</h4>
                <pre className="bg-gray-50 p-3 rounded-md border border-gray-200 whitespace-pre-wrap">
                  {problem.output_format}
                </pre>
              </div>
            )}
            
            {problem.constraints && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Constraints:</h4>
                <pre className="bg-gray-50 p-3 rounded-md border border-gray-200 whitespace-pre-wrap">
                  {problem.constraints}
                </pre>
              </div>
            )}
            
            {problem.sample_input && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Sample Input:</h4>
                <pre className="bg-gray-50 p-3 rounded-md border border-gray-200 font-mono">
                  {problem.sample_input}
                </pre>
              </div>
            )}
            
            {problem.sample_output && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Sample Output:</h4>
                <pre className="bg-gray-50 p-3 rounded-md border border-gray-200 font-mono">
                  {problem.sample_output}
                </pre>
              </div>
            )}
            
            <div className="mt-6 text-sm text-gray-500">
              <p>Time Limit: {problem.time_limit_ms}ms</p>
              <p>Memory Limit: {problem.memory_limit_kb}KB</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  const Dialog = ({ open, onOpenChange, children }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog content with animation */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 animate-in zoom-in-95 fade-in-0">
        {children}
      </div>
    </div>
  );
};

const Textarea = ({ 
  value, 
  onChange, 
  placeholder, 
  className = '', 
  id,
  rows = 3,
  error = false,
  disabled = false 
}) => (
  <textarea
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    rows={rows}
    className={`
      w-full px-3 py-2 border rounded-lg transition-colors duration-200 resize-none
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
      ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
      ${className}
    `}
  />
);

// Dialog Header with close button
const DialogHeader = ({ children, onClose, showCloseButton = true }) => (
  <div className="flex items-center justify-between p-6 border-b border-gray-100">
    <div className="flex-1">
      {children}
    </div>
    {showCloseButton && (
      <button
        onClick={onClose}
        className="ml-4 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-400 hover:text-gray-600"
        aria-label="Close dialog"
      >
        <X size={20} />
      </button>
    )}
  </div>
);

// Dialog Title
const DialogTitle = ({ children, icon, variant = 'default' }) => {
  const iconColors = {
    default: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
    info: 'text-blue-600'
  };

  const getIcon = () => {
    if (icon) return icon;
    switch (variant) {
      case 'success': return <CheckCircle size={24} />;
      case 'warning': return <AlertCircle size={24} />;
      case 'error': return <AlertCircle size={24} />;
      case 'info': return <Info size={24} />;
      default: return null;
    }
  };

  return (
    <div className="flex items-center gap-3">
      {getIcon() && (
        <div className={iconColors[variant]}>
          {getIcon()}
        </div>
      )}
      <h2 className="text-xl font-semibold text-gray-900 leading-tight">
        {children}
      </h2>
    </div>
  );
};

// Dialog Description
const DialogDescription = ({ children, className = '' }) => (
  <p className={`text-gray-600 text-sm leading-relaxed ${className}`}>
    {children}
  </p>
);

// Dialog Content
const DialogContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

// Dialog Footer
const DialogFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 bg-gray-50 rounded-b-xl flex gap-3 justify-end ${className}`}>
    {children}
  </div>
);

// Enhanced Button Component
const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  className = '', 
  variant = 'primary',
  size = 'md',
  loading = false 
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        ${variants[variant]} ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
        ${className}
      `}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

// Enhanced Input Component
const Input = ({ 
  value, 
  onChange, 
  placeholder, 
  className = '', 
  id, 
  type = 'text',
  error = false,
  disabled = false 
}) => (
  <input
    type={type}
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    className={`
      w-full px-3 py-2 border rounded-lg transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
      ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
      ${className}
    `}
  />
);

// Enhanced Label Component
const Label = ({ children, htmlFor, className = '', required = false }) => (
  <label
    htmlFor={htmlFor}
    className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
  >
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

  // Render Code Editor
  const renderCodeEditor = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
        <div className="border-b border-gray-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-1"
              disabled={isReviewMode}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
            
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
          
          {isReviewMode && (
            <button 
              className="flex items-center text-blue-600 hover:text-blue-800"
              onClick={() => {
                const blob = new Blob([code], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `submission-${id}.${
                  language === 'python' ? 'py' : 
                  language === 'javascript' ? 'js' : 
                  language === 'java' ? 'java' : 
                  language === 'cpp' ? 'cpp' : 'txt'
                }`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              <Download size={16} className="mr-1.5" />
              Download Code
            </button>
          )}
        </div>
        
        <div style={{ height: isDesktop ? 'calc(100vh - 300px)' : '70vh' }}>
          <Editor
            height="100%"
            language={language}
            value={code}
            theme={theme}
            onChange={(value) => !isReviewMode && setCode(value)}
            options={{
              fontSize: fontSize,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              readOnly: isReviewMode // Make editor read-only in review mode
            }}
          />
        </div>
        
        {!isReviewMode && (
          <div className="h-48 bg-gray-50 p-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-2">Console Output</h3>
            <pre className="bg-white border border-gray-200 p-3 rounded h-32 overflow-y-auto">
              {output || 'Run your code to see output here'}
            </pre>
          </div>
        )}
      </div>
    );
  };

  // Render Review Tab
  const renderReviewTab = () => {
    if (!isReviewMode) return null;
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Review Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <h2 className="text-lg font-medium">Judge Review</h2>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score (0 - {problem?.points} points)
                </label>
                <input
                  type="number"
                  min="0"
                  max={problem?.points}
                  value={judgeScore}
                  onChange={(e) => setJudgeScore(Math.min(problem?.points || 0, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="mt-2 flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        judgeScore >= 60 ? 'bg-green-600' : 'bg-red-600'
                      }`} 
                      style={{ width: `${Math.min(100, judgeScore)}%` }}  // Cap visual width at 100%
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">{judgeScore}%</span>
                </div>
              </div>
            
              <Button
                onClick={handleReviewSubmit}
                disabled={isSaving}
                className="w-full flex items-center justify-center"
              >
                <Save size={18} className="mr-2" />
                {isSaving ? 'Saving...' : 'Save Review'}
              </Button>
            </div>
          </div>
          
          {/* Submission Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <h2 className="text-lg font-medium">Submission Info</h2>
            </div>
            
            <div className="p-6">
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Memory Usage:</dt>
                  <dd className="text-sm text-gray-900">{submission?.memory_kb}KB</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        
        {/* Test Results */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <h2 className="text-lg font-medium">Test Results</h2>
            </div>
            
            <div className="p-6">
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
                  <p>No test results available for this submission.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">
                      {testResults.filter(t => t.passed).length} of {testResults.length} tests passed.
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div 
                        className="h-2.5 rounded-full bg-green-600" 
                        style={{ width: `${(testResults.filter(t => t.passed).length / testResults.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
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
                            <Check className="text-green-600 mr-2" size={18} />
                          ) : (
                            <X className="text-red-600 mr-2" size={18} />
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
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">

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

      {/* Header */}
      <header className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10
        ${isDesktop ? 'py-6' : 'py-4'}`}>
        <div className={`mx-auto px-4 sm:px-6 ${isDesktop ? 'max-w-full px-8' : 'max-w-7xl'}`}>
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <button
                onClick={handleBack}
                className="mr-4 p-2 rounded-full hover:bg-gray-100"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center">
                  {isReviewMode ? (
                    <>
                      <FileText className="mr-2" size={20} />
                      Submission Review
                    </>
                  ) : (
                    <>
                      <Code className="mr-2" size={20} />
                      {problem?.title || 'Problem Solver'}
                    </>
                  )}
                </h1>
                {problem && (
                  <p className="text-sm text-gray-500 mt-1">
                    {isDesktop ? problem.title : ''} {problem.difficulty} ({problem.points} points)
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              {/* Status badge for review mode */}
              {isReviewMode && submission && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium
                  ${getStatusBadgeClass(submission.status)}`}
                >
                  {submission.status.charAt(0).toUpperCase() + 
                   submission.status.slice(1).replace(/_/g, ' ')}
                </span>
              )}
              
              {/* Action buttons based on mode */}
              {isReviewMode ? (
                <Button
                  onClick={handleReviewSubmit}
                  disabled={isSaving}
                  className="flex items-center"
                >
                  <Save size={18} className="mr-2" />
                  {isSaving ? 'Saving...' : 'Save Review'}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {runCode()}}
                    className="flex items-center"
                    variant="secondary"
                  >
                    <Code size={18} className="mr-2" />
                    Run Code
                  </Button>
                  <Button
                    onClick={() => {submitSolution()}}
                    className="flex items-center"
                  >
                    <Check size={18} className="mr-2" />
                    Submit
                  </Button>
                  {submissionStatus === 'accepted' && (
                    <Button
                      onClick={() => {openSubmissionModal()}}
                      className="flex items-center"
                    >
                      {isRunning ? 'Posting...' : 'Post Publicly'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation tabs - only show in mobile view */}
          {!isDesktop && (
            <div className="flex border-t border-gray-200 mt-4 pt-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-4 py-2 mr-2 rounded-t-lg ${
                  activeTab === 'code' 
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center">
                  <Code size={16} className="mr-1.5" />
                  Code
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 mr-2 rounded-t-lg ${
                  activeTab === 'details' 
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center">
                  <FileText size={16} className="mr-1.5" />
                  Problem Details
                </span>
              </button>
              
              {isReviewMode && (
                <button
                  onClick={() => setActiveTab('review')}
                  className={`px-4 py-2 mr-2 rounded-t-lg ${
                    activeTab === 'review' 
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center">
                    <Award size={16} className="mr-1.5" />
                    Review
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>
      
      {/* Success message */}
      {saveSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> Review saved successfully.</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 py-6 ${isDesktop ? 'max-w-full' : 'max-w-3xl'}`}>
        {isDesktop ? (
          // Desktop layout - side by side with larger base
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-1">{renderProblemDetails()}</div>
            <div className="col-span-1">{renderCodeEditor()}</div>
            {isReviewMode && <div className="col-span-2 mt-6">{renderReviewTab()}</div>}
          </div>
        ) : (
          // Mobile layout - tabbed interface
          <div>
            {activeTab === 'code' && renderCodeEditor()}
            {activeTab === 'details' && renderProblemDetails()}
            {activeTab === 'review' && isReviewMode && renderReviewTab()}
          </div>
        )}
      </main>
    </div>
  );
}

export default SolvePage;