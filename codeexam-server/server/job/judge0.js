const axios = require('axios');
const dotenv = require('dotenv');
const Submission = require('../models/Submission');

dotenv.config();

async function submitToJudge0(submissionId, sourceCode, languageId, testCases) {
    try {
        console.log(`[Judge0] Submitting code for submission ${submissionId} with language ${languageId}`);

        // Prepare submissions array for batch submission
        const submissions = testCases.map(testCase => ({
            source_code: sourceCode,
            language_id: languageId,
            stdin: testCase.input,
            expected_output: testCase.expectedOutput
        }));

        // Submit batch request
        const createResponse = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch`, {
            submissions
        });

        const tokens = createResponse.data.map(submission => submission.token);
        console.log(`[Judge0] Batch submission created with tokens:`, tokens);

        // Update submission status to processing
        await updateSubmissionStatus(submissionId, 'processing');

        let results = [];
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
            console.log(`[Judge0] Checking batch submission status (attempt ${attempts + 1}/${maxAttempts})`);

            // Get status for all submissions in batch
            const checkResponse = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`, {
                params: {
                    tokens: tokens.join(',')
                }
            });
            console.log({ checkResponse: checkResponse.data })

            // Ensure allSubmissions is an array
            const allSubmissions = Array.isArray(checkResponse.data.submissions) ? checkResponse.data.submissions : [checkResponse.data.submissions];

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

// Helper function to update submission status
async function updateSubmissionStatus(submissionId, status) {
    try {
        await Submission.update(
            { status },
            { where: { id: submissionId } }
        );
        console.log(`[Judge0] Updated submission ${submissionId} status to ${status}`);
    } catch (error) {
        console.error(`[Judge0] Error updating submission ${submissionId} status:`, error);
    }
}

// Helper function to update submission with error
async function updateSubmissionError(submissionId, errorMessage) {
    try {
        await Submission.update(
            { 
                status: 'error',
                error_message: errorMessage,
                completed_at: new Date()
            },
            { where: { id: submissionId } }
        );
        console.log(`[Judge0] Updated submission ${submissionId} with error status`);
    } catch (error) {
        console.error(`[Judge0] Error updating submission ${submissionId} with error:`, error);
    }
}

// Process Judge0 results and update submission
async function processResults(submissionId, results) {
    try {
        // Calculate score based on test case results
        const totalTests = results.length;
        const passedTests = results.filter(result => result.status.id === 3).length; // 3 = Accepted
        const score = Math.round((passedTests / totalTests) * 100);
        
        // Calculate average runtime and memory
        const runtimes = results.map(r => parseFloat(r.time) || 0);
        const memories = results.map(r => parseFloat(r.memory) || 0);
        const avgRuntime = runtimes.reduce((a, b) => a + b, 0) / runtimes.length;
        const avgMemory = memories.reduce((a, b) => a + b, 0) / memories.length;
        
        // Determine overall status
        const allPassed = passedTests === totalTests;
        const status = allPassed ? 'accepted' : 'rejected';
        
        // Format test results for storage
        const testResults = results.map((result, index) => ({
            passed: result.status.id === 3,
            error: result.status.id !== 3 ? result.status.description : null,
            runtime_ms: parseFloat(result.time) || 0,
            memory_kb: parseFloat(result.memory) || 0,
            stdout: result.stdout,
            stderr: result.stderr,
            compile_output: result.compile_output
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
        
        console.log(`[Judge0] Processed results for submission ${submissionId}: status=${status}, score=${score}`);
    } catch (error) {
        console.error(`[Judge0] Error processing results for submission ${submissionId}:`, error);
        await updateSubmissionError(submissionId, 'Error processing judge results');
    }
}

module.exports = submitToJudge0;
