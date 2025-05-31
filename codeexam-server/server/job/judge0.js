const axios = require('axios');
const dotenv = require('dotenv');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');

dotenv.config();

// Helper function to encode string to base64
function encodeToBase64(text) {
    return Buffer.from(text).toString('base64');
}

// Helper function to decode base64 to string
function decodeFromBase64(encoded) {
    if (!encoded) return '';
    try {
        return Buffer.from(encoded, 'base64').toString('utf8');
    } catch (error) {
        console.error('Error decoding base64:', error);
        return '';
    }
}

async function submitToJudge0(submissionId, sourceCode, languageId, testCases) {
    try {
        console.log(`[Judge0] Submitting code for submission ${submissionId} with language ${languageId}`);
        console.log(`[Judge0] Test cases count: ${testCases.length}`);

        // Validate test cases format
        if (!Array.isArray(testCases) || testCases.length === 0) {
            throw new Error('Test cases must be a non-empty array');
        }

        // Validate each test case and log them for debugging
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            if (testCase.input === undefined || testCase.input === null || 
                testCase.output === undefined || testCase.output === null) {
                console.error(`[Judge0] Invalid test case ${i}:`, testCase);
                throw new Error(`Test case ${i} must have both input and output properties (empty strings are allowed)`);
            }
            console.log(`[Judge0] Test case ${i}:`, {
                input: testCase.input,
                expected_output: testCase.output
            });
        }

        // Prepare submissions array for batch submission with base64 encoding
        const submissions = testCases.map((testCase, index) => {            
            return {
                source_code: encodeToBase64(sourceCode),
                language_id: parseInt(languageId), // Ensure it's a number
                stdin: encodeToBase64(testCase.input),
                expected_output: encodeToBase64(testCase.output),
                // Add CPU and memory limits based on problem constraints
                cpu_time_limit: "2.0", // 2 seconds as string
                memory_limit: "128000", // 128MB in KB as string
                // Add additional Judge0 parameters for self-hosted instance
                wall_time_limit: "5.0", // 5 seconds wall time as string
                enable_per_process_and_thread_time_limit: false,
                enable_per_process_and_thread_memory_limit: false,
                max_processes_and_or_threads: 60,
                enable_network: false
            };
        });
        
        console.log(`[Judge0] Prepared ${submissions.length} test cases for batch submission`);
        console.log(`[Judge0] Sample submission payload:`, JSON.stringify(submissions[0], null, 2));
        
        // First, update status to judging
        await updateSubmissionStatus(submissionId, 'judging');
        
        // Prepare headers for self-hosted Judge0 (no RapidAPI headers needed)
        const headers = {
            'Content-Type': 'application/json'
        };

        // Only add RapidAPI headers if they exist in environment (for RapidAPI Judge0)
        if (process.env.JUDGE0_RAPIDAPI_KEY) {
            headers['X-RapidAPI-Host'] = process.env.JUDGE0_RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';
            headers['X-RapidAPI-Key'] = process.env.JUDGE0_RAPIDAPI_KEY;
        }

        console.log(`[Judge0] Using API URL: ${process.env.JUDGE0_API_URL}`);
        console.log(`[Judge0] Request headers:`, headers);

        // Submit batch request with base64_encoded=true
        const createResponse = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=true`, {
            submissions
        }, {
            headers,
            timeout: 30000 // 30 second timeout
        });

        console.log(`[Judge0] Create response status:`, createResponse.status);
        console.log(`[Judge0] Create response data:`, createResponse.data);
        
        if (!createResponse.data || !Array.isArray(createResponse.data)) {
            console.error(`[Judge0] Invalid response from batch submission:`, createResponse.data);
            throw new Error('Invalid response from Judge0 batch submission');
        }

        const tokens = createResponse.data.map(submission => submission.token);
        console.log(`[Judge0] Batch submission created with tokens:`, tokens);

        let results = [];
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
            console.log(`[Judge0] Checking batch submission status (attempt ${attempts + 1}/${maxAttempts})`);

            try {
                // Get status for all submissions in batch
                const checkResponse = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=true&tokens=${tokens.join(',')}`, {
                    headers,
                    timeout: 10000 // 10 second timeout for status checks
                });

                // Handle different response formats from self-hosted Judge0
                let allSubmissions = [];
                if (checkResponse.data.submissions) {
                    allSubmissions = Array.isArray(checkResponse.data.submissions) ? 
                        checkResponse.data.submissions : 
                        [checkResponse.data.submissions];
                } else if (Array.isArray(checkResponse.data)) {
                    allSubmissions = checkResponse.data;
                } else {
                    console.error(`[Judge0] Unexpected response format:`, checkResponse.data);
                    throw new Error('Unexpected response format from Judge0');
                }

                // Log detailed status for debugging
                const statusDescriptions = allSubmissions
                    .filter(sub => sub && sub.status)
                    .map(sub => sub.status.description || sub.status);
                console.log(`[Judge0] Current batch status:`, statusDescriptions);

                // Log detailed error information for Internal Error cases
                allSubmissions.forEach((sub, index) => {
                    if (sub && sub.status && (sub.status.description === 'Internal Error' || sub.status.id >= 4)) {
                        console.log(`[Judge0] Test case ${index} error details:`, {
                            status: sub.status,
                            stdout: decodeFromBase64(sub.stdout),
                            stderr: decodeFromBase64(sub.stderr),
                            compile_output: decodeFromBase64(sub.compile_output),
                            message: sub.message,
                            time: sub.time,
                            memory: sub.memory
                        });
                    }
                });

                // Check if all submissions are completed (status id >= 3)
                const allCompleted = allSubmissions.every(submission =>
                    submission && submission.status && submission.status.id >= 3
                );

                if (allCompleted) {
                    results = allSubmissions;
                    console.log(`[Judge0] All submissions in batch completed`);
                    break;
                }

                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between checks
                attempts++;

            } catch (checkError) {
                console.error(`[Judge0] Error checking batch status (attempt ${attempts + 1}):`, checkError.message);
                if (attempts >= maxAttempts - 1) {
                    throw checkError;
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
                attempts++;
            }
        }

        if (results.length === 0) {
            console.error(`[Judge0] Batch submission ${submissionId} timed out after ${maxAttempts} attempts`);
            await updateSubmissionError(submissionId, 'Judge0 batch submission timed out');
            throw new Error('Judge0 batch submission timed out');
        }

        // Process results and update submission in database
        await processResults(submissionId, results);

        console.log(`[Judge0] Batch submission ${submissionId} completed successfully`);
        return results;

    } catch (error) {
        console.error(`[Judge0] Batch submission error for ${submissionId}:`, error.response?.data || error.message);
        
        // Log more details about the error
        if (error.response) {
            console.error(`[Judge0] Response status:`, error.response.status);
            console.error(`[Judge0] Response headers:`, error.response.headers);
            console.error(`[Judge0] Response data:`, error.response.data);
        }
        
        await updateSubmissionError(submissionId, error.message || 'Unknown error during code execution');
        throw error;
    }
}

/**
 * Map status values to ensure they conform to the model's validation rules
 */
function mapToValidStatus(status) {
    const validStatuses = [
        'pending', 'judging', 'accepted', 'wrong_answer', 
        'time_limit_exceeded', 'memory_limit_exceeded', 
        'compilation_error', 'runtime_error', 'error'
    ];
    
    const statusMap = {
        'processing': 'judging',
        'internal_error': 'runtime_error'
    };
    
    if (validStatuses.includes(status)) {
        return status;
    }
    
    return statusMap[status] || 'pending';
}

// Helper function to update submission status
async function updateSubmissionStatus(submissionId, status) {
    try {
        const validatedStatus = mapToValidStatus(status);
        
        await Submission.update(
            { status: validatedStatus },
            { where: { id: submissionId } }
        );
        
        console.log(`[Judge0] Updated submission ${submissionId} status to ${validatedStatus}`);
    } catch (error) {
        console.error(`[Judge0] Error updating submission ${submissionId} status:`, error);
    }
}

// Helper function to update submission with error
async function updateSubmissionError(submissionId, errorMessage) {
    try {
        const errorStatus = mapToValidStatus('runtime_error');
        
        await Submission.update(
            {
                status: errorStatus,
                test_results: JSON.stringify({ error: errorMessage }),
                completed_at: new Date()
            },
            { where: { id: submissionId } }
        );
        console.log(`[Judge0] Updated submission ${submissionId} with ${errorStatus} status`);
    } catch (error) {
        console.error(`[Judge0] Error updating submission ${submissionId} with error:`, error);
    }
}

// Process Judge0 results and update submission
async function processResults(submissionId, results) {
    try {
        const submission = await Submission.findByPk(submissionId);
        if (!submission) {
            throw new Error(`Submission ${submissionId} not found`);
        }

        const problem = await Problem.findByPk(submission.problem_id);
        if (!problem) {
            throw new Error(`Problem ${submission.problem_id} not found`);
        }

        const totalTests = results.length;
        let passedTests = 0;
        let hasCompilationError = false;
        let hasRuntimeError = false;
        let hasTimeLimit = false;
        let hasMemoryLimit = false;
        let hasInternalError = false;

        // Analyze results to determine status and count
        results.forEach((result, index) => {
            const statusId = result.status.id;
            const statusDescription = result.status.description;
            
            console.log(`[Judge0] Test case ${index} result: status=${statusDescription} (id=${statusId})`);
            
            if (statusId === 3) { // Accepted
                passedTests++;
            } else if (statusId === 6) { // Compilation Error
                hasCompilationError = true;
            } else if (statusId === 5) { // Time Limit Exceeded
                hasTimeLimit = true;
            } else if (statusId === 4) { // Wrong Answer
                // This is handled by default
            } else if (statusId >= 7 || statusDescription === 'Internal Error') { // Runtime errors, internal errors, etc.
                hasRuntimeError = true;
                if (statusDescription === 'Internal Error') {
                    hasInternalError = true;
                }
            }
        });

        const passedPercentage = passedTests / totalTests;
        const score = Math.round(passedPercentage * problem.points);

        // Determine overall status
        let finalStatus;
        if (hasInternalError) {
            finalStatus = 'runtime_error';
        } else if (hasCompilationError) {
            finalStatus = 'compilation_error';
        } else if (hasTimeLimit) {
            finalStatus = 'time_limit_exceeded';
        } else if (hasMemoryLimit) {
            finalStatus = 'memory_limit_exceeded';
        } else if (passedTests === totalTests) {
            finalStatus = 'accepted';
        } else {
            finalStatus = 'wrong_answer';
        }

        // Calculate average runtime and memory (handle null values)
        const runtimes = results.map(r => parseFloat(r.time) || 0);
        const memories = results.map(r => parseFloat(r.memory) || 0);
        const avgRuntime = runtimes.length > 0 ? runtimes.reduce((a, b) => a + b, 0) / runtimes.length : 0;
        const avgMemory = memories.length > 0 ? memories.reduce((a, b) => a + b, 0) / memories.length : 0;

        // Format test results for storage, with base64 decoding
        const testResults = results.map((result, index) => ({
            passed: result.status.id === 3,
            status: result.status.description,
            status_id: result.status.id,
            runtime_ms: parseFloat(result.time) || 0,
            memory_kb: parseFloat(result.memory) || 0,
            stdout: decodeFromBase64(result.stdout),
            stderr: decodeFromBase64(result.stderr),
            compile_output: decodeFromBase64(result.compile_output),
            message: result.message || null
        }));

        // Update submission with results
        await Submission.update(
            {
                status: finalStatus,
                score,
                execution_time_ms: Math.round(avgRuntime * 1000), // Convert to ms
                memory_used_kb: Math.round(avgMemory),
                test_results: JSON.stringify(testResults),
                judged_at: new Date()
            },
            { where: { id: submissionId } }
        );

        console.log(`[Judge0] Processed results for submission ${submissionId}: status=${finalStatus}, score=${score}/${problem.points} (${Math.round(passedPercentage * 100)}% of tests passed)`);
    } catch (error) {
        console.error(`[Judge0] Error processing results for submission ${submissionId}:`, error);
        await updateSubmissionError(submissionId, 'Error processing judge results');
    }
}

module.exports = { submitToJudge0 };