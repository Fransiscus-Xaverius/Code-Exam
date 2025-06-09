const Submission = require('../models/Submission');
const SubmissionDiscussion = require('../models/SubmissionDiscussion');
const Problem = require('../models/Problem');
const User = require('../models/User');
const Competition = require('../models/Competition');
const sequelize = require('../config/database');
const { submitToJudge0 } = require('../job/judge0');
const CompetitionProblem = require('../models/CompetitionProblem');
const CompetitionParticipant = require('../models/CompetitionParticipant');
const Sequelize = require('sequelize');
const { Op } = Sequelize;

// Helper function to get submission for like functionality
exports.getSubmissionForLike = async (submissionId) => {
  try {
    return await Submission.findByPk(submissionId, {
      attributes: ['id', 'is_published', 'status']
    });
  } catch (error) {
    console.error('Error getting submission for like:', error);
    return null;
  }
};

// @desc    Submit a solution to a problem
// @route   POST /api/submissions
// @access  Private
exports.createSubmission = async (req, res, next) => {
  try {
    console.log('Request body:', req.body);
    const { problem_id, competition_id, code, language } = req.body;

    // Validate required fields
    if (!problem_id || !code || !language) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide problem_id, code, and language'
      });
    }

    // Check if problem exists
    console.log('Finding problem with ID:', problem_id);
    const problem = await Problem.findByPk(problem_id);
    if (!problem) {
      console.log('Problem not found with ID:', problem_id);
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Create submission
    console.log('Creating submission for user:', req.user.id);
    const submission = await Submission.create({
      user_id: req.user.id,
      problem_id,
      competition_id: competition_id || null,
      code,
      language,
      status: 'pending',
      submitted_at: new Date()
    });

    console.log('Submission created:', submission.id);

    // use to debug
    // const submission = await Submission.create({
    //     user_id: req.user.id,
    //     problem_id,
    //     competition_id: competition_id || null,
    //     code,
    //     language,
    //     status: 'accepted',
    //     submitted_at: new Date()
    // });  

    // TODO: Queue for judging (in a real application, you'd trigger the judge process)
    console.log('Submitting to Judge0:', submission.id);
    // Ensure test cases are passed to the judge
    if (!problem.hidden_test_cases || !Array.isArray(problem.hidden_test_cases) || problem.hidden_test_cases.length === 0) {
      console.error(`Problem ${problem_id} has no valid hidden test cases. Cannot submit to judge.`);
      // Update submission status to indicate an error related to problem setup
      await submission.update({ status: 'runtime_error', judge_comment: 'Problem configuration error: No valid test cases found.' });
      // Return an internal server error as this is a setup issue, not a user input issue
      return res.status(500).json({
        success: false,
        message: 'Internal server error: Problem is missing test cases.'
      });
    }
    console.log('timelimit:', problem.time_limit_ms);
    console.log('memory limit:', problem.memory_limit_kb);
    const timeLimit = ((parseInt(problem.time_limit_ms) || 1000) / 1000).toFixed(1);
    const memoryLimit = problem.memory_limit_kb || 128000;

    // Submit to judge system
    submitToJudge0(submission.id, code, language, problem.hidden_test_cases, timeLimit, memoryLimit);

    console.log('Submission process completed successfully');
    res.status(201).json({
      success: true,
      submission: {
        id: submission.id,
        status: submission.status,
        submitted_at: submission.submitted_at
      }
    });
  } catch (error) {
    console.error('Create submission error:', error);

    // Handle validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map(e => e.message);
      console.log('Validation error:', messages);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    next(error);
  }
};

// @desc    Submit a formal solution for evaluation
// @route   POST /api/submissions/submit
// @access  Private
exports.submit = async (req, res, next) => {
  try {
    console.log('Submit solution - Request body:', req.body);
    const { problem_id, competition_id, code, language } = req.body;

    // Validate required fields
    if (!problem_id || !code || !language) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide problem_id, code, and language'
      });
    }

    // Check if problem exists
    console.log('Finding problem with ID:', problem_id);
    const problem = await Problem.findByPk(problem_id);
    if (!problem) {
      console.log('Problem not found with ID:', problem_id);
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Check if competition exists if competition_id is provided
    if (competition_id) {
      const competition = await Competition.findByPk(competition_id);
      if (!competition) {
        return res.status(404).json({
          success: false,
          message: 'Competition not found'
        });
      }

      // Check if the user is registered for the competition
      if (competition.registration_required) {
        const participant = await CompetitionParticipant.findOne({
          where: {
            competition_id,
            user_id: req.user.id
          }
        });

        if (!participant && req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'You are not registered for this competition'
          });
        }
      }

      // Check if competition is active
      const now = new Date();
      if (now < new Date(competition.start_time) && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Competition has not started yet'
        });
      }

      if (now > new Date(competition.end_time) && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Competition has ended'
        });
      }

      // Verify the problem is part of the competition
      const competitionProblem = await CompetitionProblem.findOne({
        where: {
          competition_id,
          problem_id
        }
      });

      if (!competitionProblem) {
        return res.status(400).json({
          success: false,
          message: 'This problem is not part of the specified competition'
        });
      }
    }

    // Create submission with formal status
    console.log('Creating formal submission for user:', req.user.id);
    const submission = await Submission.create({
      user_id: req.user.id,
      problem_id,
      competition_id: competition_id || null,
      code,
      language,
      status: 'pending',
      submitted_at: new Date()
    });

    console.log('Formal submission created:', submission.id);

    // Submit to judge system for evaluation
    console.log('Submitting to Judge0 for formal evaluation:', submission.id);
    // Ensure test cases are passed to the judge
    if (!problem.hidden_test_cases || !Array.isArray(problem.hidden_test_cases) || problem.hidden_test_cases.length === 0) {
      console.error(`Problem ${problem_id} has no valid hidden test cases. Cannot submit to judge.`);
      // Update submission status to indicate an error related to problem setup
      await submission.update({ status: 'runtime_error', judge_comment: 'Problem configuration error: No valid test cases found.' });
      // Return an internal server error as this is a setup issue, not a user input issue
      return res.status(500).json({
        success: false,
        message: 'Internal server error: Problem is missing test cases.'
      });
    }
    console.log('timelimit:', problem.time_limit_ms);
    console.log('memory limit:', problem.memory_limit_kb);
    const timeLimit = ((parseInt(problem.time_limit_ms) || 1000) / 1000).toFixed(1);
    const memoryLimit = problem.memory_limit_kb || 128000;

    // Submit to judge system
    submitToJudge0(submission.id, code, language, problem.hidden_test_cases, timeLimit, memoryLimit);

    console.log('Formal submission process completed successfully');
    res.status(201).json({
      success: true,
      submission: {
        id: submission.id,
        status: submission.status,
        submitted_at: submission.submitted_at
      }
    });
  } catch (error) {
    console.error('Create formal submission error:', error);

    // Handle validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map(e => e.message);
      console.log('Validation error:', messages);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    next(error);
  }
};

// @desc Get public published submissions
// @route GET /api/public/submissions
// @access Public (no authentication required)
exports.getPublicSubmissions = async (req, res, next) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Base filtering - only published submissions
    const filter = {
      is_published: 1
    };

    // Filter parameter from frontend ('all', 'accepted', 'my')
    const filterType = req.query.filter;
    if (filterType === 'accepted') {
      filter.status = 'accepted';
    } else if (filterType === 'my' && req.user) {
      filter.user_id = req.user.id;
    }

    // Additional specific filters
    if (req.query.problem_id) {
      filter.problem_id = req.query.problem_id;
    }

    if (req.query.language) {
      filter.language = req.query.language;
    }

    if (req.query.user_id) {
      filter.user_id = req.query.user_id;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Search functionality
    let searchCondition = {};
    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      if (searchTerm) {
        searchCondition = {
          [Op.or]: [
            { '$problem.title$': { [Op.like]: `%${searchTerm}%` } },
            { '$submission_discussions.title$': { [Op.like]: `%${searchTerm}%` } },
            { '$submission_discussions.content$': { [Op.like]: `%${searchTerm}%` } },
            { '$user.username$': { [Op.like]: `%${searchTerm}%` } },
            { language: { [Op.like]: `%${searchTerm}%` } }
          ]
        };
      }
    }

    // Combine base filter with search condition
    const whereCondition = {
      ...filter,
      ...searchCondition
    };

    // Sorting logic
    let orderBy = [['submitted_at', 'DESC']]; // default
    const sortType = req.query.sort;
    const tabType = req.query.tab;

    // Handle tab-specific sorting first, then apply sort parameter
    if (tabType === 'popular') {
  orderBy = [
    [Sequelize.literal(`(
      COALESCE((SELECT COUNT(DISTINCT submission_likes.id) FROM submission_likes WHERE submission_likes.submission_id = Submission.id), 0) +
      COALESCE((SELECT COUNT(DISTINCT dr.id) FROM discussion_replies dr JOIN submission_discussions sd ON dr.discussion_id = sd.id WHERE sd.submission_id = Submission.id), 0)
    )`), 'DESC'],
    ['submitted_at', 'DESC']
  ];

  whereCondition.submitted_at = {
    [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  };
} else if (tabType === 'trending') {
      // Trending: submissions with recent activity (likes/comments in last 7 days)
      orderBy = [
        [Sequelize.literal(`(
          COALESCE((SELECT COUNT(*) FROM submission_likes WHERE submission_likes.submission_id = Submission.id AND submission_likes.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)), 0) +
          COALESCE((SELECT COUNT(*) FROM discussion_replies dr JOIN submission_discussions sd ON dr.discussion_id = sd.id WHERE sd.submission_id = Submission.id AND dr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)), 0)
        )`), 'DESC'],
        ['submitted_at', 'DESC']
      ];
    } else {
      // Apply sort parameter for 'recent' tab or when no tab specified
      switch (sortType) {
        case 'newest':
          orderBy = [['submitted_at', 'DESC']];
          break;
        case 'oldest':
          orderBy = [['submitted_at', 'ASC']];
          break;
        case 'most_liked':
          orderBy = [
            [Sequelize.literal('COALESCE((SELECT COUNT(*) FROM submission_likes WHERE submission_likes.submission_id = Submission.id), 0)'), 'DESC'],
            ['submitted_at', 'DESC']
          ];
          break;
        case 'most_discussed':
          orderBy = [
            [Sequelize.literal('COALESCE((SELECT COUNT(*) FROM discussion_replies dr JOIN submission_discussions sd ON dr.discussion_id = sd.id WHERE sd.submission_id = Submission.id), 0)'), 'DESC'],
            ['submitted_at', 'DESC']
          ];
          break;
        default:
          orderBy = [['submitted_at', 'DESC']];
      }
    }

    // Build include array
    const includeArray = [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      },
      {
        model: Problem,
        as: 'problem',
        attributes: ['id', 'title', 'difficulty']
      },
      {
        model: SubmissionDiscussion,
        as: 'submission_discussions',
        attributes: ['id', 'title', 'content', 'created_at', 'updated_at'],
        required: false
      }
    ];

    // Build attributes with virtual fields
    const attributesConfig = {
      include: [
        // Add virtual fields for likes and comment counts using proper table relationships
        [
          Sequelize.literal('COALESCE((SELECT COUNT(*) FROM submission_likes WHERE submission_likes.submission_id = Submission.id), 0)'),
          'likes'
        ],
        [
          Sequelize.literal('COALESCE((SELECT COUNT(*) FROM discussion_replies dr JOIN submission_discussions sd ON dr.discussion_id = sd.id WHERE sd.submission_id = Submission.id), 0)'),
          'commentCount'
        ]
      ],
      exclude: ['error_message'] // Don't send error messages
    };

    // Add user like status if user is authenticated
    if (req.user) {
      attributesConfig.include.push([
        Sequelize.literal(`COALESCE((SELECT 1 FROM submission_likes WHERE submission_likes.submission_id = Submission.id AND submission_likes.user_id = ${req.user.id}), 0)`),
        'isLiked'
      ]);
    }

    // Get submissions with count
    const { count, rows: submissions } = await Submission.findAndCountAll({
      where: whereCondition,
      limit,
      offset: startIndex,
      order: orderBy,
      include: includeArray,
      attributes: attributesConfig,
      distinct: true, // Important when using includes to avoid duplicate counting
      subQuery: false
    });

    // Pagination result
    const pagination = {};
    const totalPages = Math.ceil(count / limit);

    if (page < totalPages) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (page > 1) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count,
      pagination,
      submissions
    });
  } catch (error) {
    console.error('Error in getPublicSubmissions:', error);
    next(error);
  }
};

// @desc Get public submission details
// @route GET /api/public/submissions/:id
// @access Public (no authentication required)
exports.getPublicSubmission = async (req, res, next) => {
  try {
    // Build attributes with virtual fields
    const attributesConfig = {
      include: [
        // Add virtual fields for likes and comment counts
        [
          Sequelize.literal('COALESCE((SELECT COUNT(*) FROM submission_likes WHERE submission_likes.submission_id = Submission.id), 0)'),
          'likes'
        ],
        [
          Sequelize.literal('COALESCE((SELECT COUNT(*) FROM discussion_replies dr JOIN submission_discussions sd ON dr.discussion_id = sd.id WHERE sd.submission_id = Submission.id), 0)'),
          'commentCount'
        ]
      ]
    };

    // Add user like status if user is authenticated
    if (req.user) {
      attributesConfig.include.push([
        Sequelize.literal(`COALESCE((SELECT 1 FROM submission_likes WHERE submission_likes.submission_id = Submission.id AND submission_likes.user_id = ${req.user.id}), 0)`),
        'isLiked'
      ]);
    }

    const submission = await Submission.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        },
        {
          model: Problem,
          as: 'problem',
          attributes: ['id', 'title', 'difficulty', 'points']
        }
      ],
      attributes: attributesConfig
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if submission is published
    if (!submission.is_published || submission.status !== 'accepted') {
      return res.status(403).json({
        success: false,
        message: 'This submission is not publicly available'
      });
    }

    // Get submission discussion (if exists)
    const discussion = await SubmissionDiscussion.findOne({
      where: { submission_id: submission.id },
      attributes: ['id', 'title', 'content', 'created_at', 'updated_at']
    });

    // Return submission details with likes, comments, and discussion
    res.status(200).json({
      success: true,
      submission: {
        id: submission.id,
        user: submission.user,
        problem: submission.problem,
        language: submission.language,
        code: submission.code, // Include the code for learning purposes
        score: submission.score,
        runtime_ms: submission.runtime_ms,
        memory_kb: submission.memory_kb,
        submitted_at: submission.submitted_at,
        likes: submission.getDataValue('likes'),
        commentCount: submission.getDataValue('commentCount'),
        isLiked: req.user ? Boolean(submission.getDataValue('isLiked')) : false,
        discussion: discussion
      }
    });
  } catch (error) {
    next(error);
  }
};


// @desc Publish a submission (make it visible to others)
// @route PUT /api/submissions/:id/publish
// @access Private (Owner only)
exports.publishSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findByPk(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check authorization
    if (submission.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to publish this submission'
      });
    }

    //   Only allow publishing of accepted submissions
    if (submission.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Only accepted submissions can be published'
      });
    }

    submission.is_published = true;
    await submission.save();



    res.status(200).json({
      success: true,
      message: 'Submission published',
      submission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all submissions (with filtering)
// @route   GET /api/submissions
// @access  Private (Admin/Judge: all submissions, User: only their own)
exports.getSubmissions = async (req, res, next) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Add filtering
    const filter = {};

    // If user is not admin or judge, they can only see their own submissions
    if (req.user.role !== 'admin' && req.user.role !== 'judge') {
      filter.user_id = req.user.id;
    } else {
      // Admin/Judge can filter by user_id if provided
      if (req.query.user_id) {
        filter.user_id = req.query.user_id;
      }
    }

    // Additional filters
    if (req.query.problem_id) {
      filter.problem_id = req.query.problem_id;
    }

    if (req.query.competition_id) {
      filter.competition_id = req.query.competition_id;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.language) {
      filter.language = req.query.language;
    }

    // Search functionality
    let searchCondition = {};
    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      if (searchTerm) {
        searchCondition = {
          [Op.or]: [
            { '$problem.title$': { [Op.like]: `%${searchTerm}%` } },
            { '$user.username$': { [Op.like]: `%${searchTerm}%` } },
            { language: { [Op.like]: `%${searchTerm}%` } }
          ]
        };
      }
    }

    // Combine filter with search condition
    const whereCondition = {
      ...filter,
      ...searchCondition
    };

    // Sorting logic
    let orderBy = [['submitted_at', 'DESC']]; // default
    const sortBy = req.query.sortBy || 'date';
    const sortOrder = req.query.sortOrder || 'desc';

    switch (sortBy) {
      case 'date':
        orderBy = [['submitted_at', sortOrder.toUpperCase()]];
        break;
      case 'status':
        orderBy = [['status', sortOrder.toUpperCase()], ['submitted_at', 'DESC']];
        break;
      case 'score':
        orderBy = [['score', sortOrder.toUpperCase()], ['submitted_at', 'DESC']];
        break;
      case 'problem':
        orderBy = [['problem', 'title', sortOrder.toUpperCase()], ['submitted_at', 'DESC']];
        break;
      default:
        orderBy = [['submitted_at', 'DESC']];
    }

    // Get submissions with count
    const { count, rows: submissions } = await Submission.findAndCountAll({
      where: whereCondition,
      limit,
      offset: startIndex,
      order: orderBy,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        },
        {
          model: Problem,
          as: 'problem',
          attributes: ['id', 'title', 'difficulty', 'points']
        },
        {
          model: User,
          as: 'judge',
          attributes: ['id', 'username'],
          required: false
        }
      ],
      attributes: { exclude: ['code'] } // Don't send code in the list view
    });

    // Pagination result
    const pagination = {};
    const totalPages = Math.ceil(count / limit);

    if (page < totalPages) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (page > 1) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count,
      totalPages,
      currentPage: page,
      pagination,
      submissions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private (Owner/Admin/Judge)
exports.getSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        },
        {
          model: Problem,
          as: 'problem',
          attributes: ['id', 'title', 'difficulty', 'points', 'time_limit_ms', 'memory_limit_kb']
        },
        {
          model: User,
          as: 'judge',
          attributes: ['id', 'username'],
          required: false
        }
      ]
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check authorization
    if (
      submission.user_id !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'judge' &&
      !submission.is_published
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this submission'
      });
    }

    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Judge a submission
// @route   PUT /api/submissions/:id/judge
// @access  Private (Admin/Judge only)
exports.judgeSubmission = async (req, res, next) => {
  try {
    const {
      status,
      execution_time_ms,
      memory_used_kb,
      score,
      test_results,
      judge_comment
    } = req.body;

    // Validate status
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }

    // Check if status is valid
    const validStatuses = ['accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'compilation_error', 'runtime_error'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Find submission
    let submission = await Submission.findByPk(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'judge') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to judge submissions'
      });
    }

    // Update submission
    await submission.update({
      status,
      execution_time_ms: execution_time_ms || null,
      memory_used_kb: memory_used_kb || null,
      score: score || null,
      test_results: test_results || null,
      judge_comment: judge_comment || null,
      judge_id: req.user.id,
      judged_at: new Date()
    });

    // Get updated submission with associations
    submission = await Submission.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        },
        {
          model: Problem,
          as: 'problem',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'judge',
          attributes: ['id', 'username']
        }
      ]
    });

    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Judge submission error:', error);

    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    next(error);
  }
};

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private (Owner/Admin only)
exports.deleteSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findByPk(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check authorization
    if (submission.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this submission'
      });
    }

    await submission.destroy();

    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics (submission counts by status, etc.)
// @route   GET /api/submissions/stats
// @access  Private
exports.getSubmissionStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get submission counts by status
    const statusCounts = await Submission.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { user_id: userId },
      group: ['status']
    });

    // Get submission counts by problem
    const problemCounts = await Submission.findAll({
      attributes: [
        'problem_id',
        [sequelize.fn('COUNT', sequelize.col('Submission.id')), 'count']
      ],
      where: { user_id: userId },
      group: ['problem_id'],
      include: [
        {
          model: Problem,
          as: 'problem',
          attributes: ['title'],
          required: false
        }
      ]
    });

    // Get submission counts by language
    const languageCounts = await Submission.findAll({
      attributes: [
        'language',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { user_id: userId },
      group: ['language']
    });

    // Get recent submissions
    const recentSubmissions = await Submission.findAll({
      where: { user_id: userId },
      limit: 5,
      order: [['submitted_at', 'DESC']],
      include: [
        {
          model: Problem,
          as: 'problem',
          attributes: ['id', 'title'],
          required: false
        }
      ],
      attributes: ['id', 'status', 'score', 'submitted_at']
    });

    res.status(200).json({
      success: true,
      stats: {
        statusCounts,
        problemCounts,
        languageCounts,
        recentSubmissions
      }
    });
  } catch (error) {
    console.error('Error getting submission stats:', error);
    next(error);
  }
};

// @desc    Get competition submission
// @route   GET /api/competitions/:competitionId/submissions/:id
// @access  Private
exports.getCompetitionSubmission = async (req, res, next) => {
  try {
    const { competitionId, id } = req.params;
    const userId = req.user.id;

    // Check if competition exists
    const competition = await Competition.findByPk(competitionId);
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }

    // Check if submission exists and belongs to the user and the competition
    const submission = await Submission.findOne({
      where: {
        id,
        user_id: userId,
        competition_id: competitionId
      },
      include: [
        {
          model: Problem,
          as: 'problem',
          attributes: ['id', 'title', 'problem_type']
        }
      ]
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or does not belong to you in this competition'
      });
    }

    // Return submission data
    res.json({
      success: true,
      data: {
        id: submission.id,
        status: submission.status,
        code: submission.code,
        language: submission.language,
        points: submission.points,
        feedback: submission.feedback,
        test_results: submission.test_results ? JSON.parse(submission.test_results) : null,
        created_at: submission.created_at,
        problem: submission.problem
      }
    });
  } catch (error) {
    console.error('Error getting competition submission:', error);
    next(error);
  }
};