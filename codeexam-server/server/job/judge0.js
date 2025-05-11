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

        // Prepare submissions array for batch submission with base64 encoding
        const submissions = testCases.map(testCase => ({
            source_code: encodeToBase64(sourceCode),
            language_id: languageId,
            stdin: encodeToBase64(testCase.input),
            expected_output: encodeToBase64(testCase.output)
        }));
        
        console.log(`[Judge0] Prepared ${submissions.length} test cases for batch submission`);
        
        // First, update status to judging instead of processing (status validation fix)
        await updateSubmissionStatus(submissionId, 'judging');
        
        // Submit batch request with base64_encoded=true
        const createResponse = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=true`, {
            submissions
        });

        const tokens = createResponse.data.map(submission => submission.token);
        console.log(`[Judge0] Batch submission created with tokens:`, tokens);

        let results = [];
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
            console.log(`[Judge0] Checking batch submission status (attempt ${attempts + 1}/${maxAttempts})`);

            // Get status for all submissions in batch
            const checkResponse = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=true`, {
                params: {
                    tokens: tokens.join(',')
                }
            });

            // Ensure allSubmissions is an array
            const allSubmissions = Array.isArray(checkResponse.data.submissions) ? 
                checkResponse.data.submissions : 
                [checkResponse.data.submissions];

            // Safely log the status
            const statusDescriptions = allSubmissions
                .filter(sub => sub && sub.status)
                .map(sub => sub.status.description);
            console.log(`[Judge0] Current batch status:`, statusDescriptions);

            // Check if all submissions are completed
            const allCompleted = allSubmissions.every(submission =>
                submission && submission.status && submission.status.id >= 3
            );

            if (allCompleted) {
                results = allSubmissions;
                console.log(`[Judge0] All submissions in batch completed`);
                break;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
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
        console.error(`[Judge0] Batch submission error for ${submissionId}:`, error);
        await updateSubmissionError(submissionId, error.message || 'Unknown error during code execution');
        throw error;
    }
}

/**
 * Map status values to ensure they conform to the model's validation rules
 * @param {string} status - The requested status
 * @returns {string} - A valid status for the Submission model
 */
function mapToValidStatus(status) {
    // Valid statuses in the Submission model (based on error message)
    // Update this array to match your actual model's allowed values
    const validStatuses = [
        'pending', 'judging', 'accepted', 'wrong_answer', 
        'time_limit_exceeded', 'memory_limit_exceeded', 
        'compilation_error', 'runtime_error', 'error'
    ];
    
    // Define mappings for non-standard statuses
    const statusMap = {
        'processing': 'judging',  // Map 'processing' to 'judging'
    };
    
    // If the status is already valid, use it
    if (validStatuses.includes(status)) {
        return status;
    }
    
    // Otherwise use the mapping or fall back to 'pending'
    return statusMap[status] || 'pending';
}

// Helper function to update submission status
async function updateSubmissionStatus(submissionId, status) {
    try {
        // Map to a valid status according to the model's validation rules
        const validatedStatus = mapToValidStatus(status);
        
        await Submission.update(
            { status: validatedStatus },
            { where: { id: submissionId } }
        );
        
        if (status !== validatedStatus) {
            console.log(`[Judge0] Updated submission ${submissionId} status to ${validatedStatus} (original requested: ${status})`);
        } else {
            console.log(`[Judge0] Updated submission ${submissionId} status to ${validatedStatus}`);
        }
    } catch (error) {
        console.error(`[Judge0] Error updating submission ${submissionId} status:`, error);
    }
}

// Helper function to update submission with error
async function updateSubmissionError(submissionId, errorMessage) {
    try {
        // Verify that 'error' is a valid status - if not, use 'runtime_error' as a fallback
        const errorStatus = mapToValidStatus('error');
        
        await Submission.update(
            {
                status: errorStatus,
                error_message: errorMessage,
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
        // Get the submission to find the problem_id
        const submission = await Submission.findByPk(submissionId);
        if (!submission) {
            throw new Error(`Submission ${submissionId} not found`);
        }

        // Get the problem to access its points value
        const problem = await Problem.findByPk(submission.problem_id);
        if (!problem) {
            throw new Error(`Problem ${submission.problem_id} not found`);
        }

        // Calculate score based on test case results and problem points
        const totalTests = results.length;
        const passedTests = results.filter(result => result.status.id === 3).length; // 3 = Accepted
        const passedPercentage = passedTests / totalTests;

        // Calculate score as percentage of problem points
        const score = Math.round(passedPercentage * problem.points);

        // Calculate average runtime and memory
        const runtimes = results.map(r => parseFloat(r.time) || 0);
        const memories = results.map(r => parseFloat(r.memory) || 0);
        const avgRuntime = runtimes.reduce((a, b) => a + b, 0) / runtimes.length;
        const avgMemory = memories.reduce((a, b) => a + b, 0) / memories.length;

        // Determine overall status
        const allPassed = passedTests === totalTests;

        // Set status to "accepted" or "wrong_answer" based on test results
        const status = allPassed ? 'accepted' : 'wrong_answer';
        console.log({ status });

        // Format test results for storage, with base64 decoding
        const testResults = results.map((result, index) => ({
            passed: result.status.id === 3,
            error: result.status.id !== 3 ? result.status.description : null,
            runtime_ms: parseFloat(result.time) || 0,
            memory_kb: parseFloat(result.memory) || 0,
            stdout: decodeFromBase64(result.stdout),
            stderr: decodeFromBase64(result.stderr),
            compile_output: decodeFromBase64(result.compile_output)
        }));

        // Update submission with results
        await Submission.update(
            {
                status,
                score,
                runtime_ms: avgRuntime,
                memory_kb: avgMemory,
                test_results: JSON.stringify(testResults),
                completed_at: new Date()
            },
            { where: { id: submissionId } }
        );

        console.log(`[Judge0] Processed results for submission ${submissionId}: status=${status}, score=${score}/${problem.points} (${Math.round(passedPercentage * 100)}% of tests passed)`);
    } catch (error) {
        console.error(`[Judge0] Error processing results for submission ${submissionId}:`, error);
        await updateSubmissionError(submissionId, 'Error processing judge results');
    }
}

module.exports = { submitToJudge0 };