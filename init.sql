CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('competitor', 'admin', 'judge')),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    user_status VARCHAR(50),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE problems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    points INT NOT NULL,
    time_limit_ms INT NOT NULL,
    memory_limit_kb INT NOT NULL,
    input_format TEXT,
    output_format TEXT,
    constraints TEXT,
    sample_input TEXT,
    sample_output TEXT,
    hidden_test_cases JSON,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE frontend_problems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    points INT NOT NULL,
    requirements TEXT,
    starter_code TEXT,
    expected_output_image VARCHAR(255),
    solution_code TEXT,
    evaluation_criteria JSON,
    time_limit_minutes INT NOT NULL DEFAULT 60,
    tags JSON,
    resources JSON,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE frontend_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    html_code TEXT,
    css_code TEXT,
    js_code TEXT,
    screenshot_url VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'graded')),
    score INT DEFAULT 0,
    feedback TEXT,
    judge_id INT,
    judged_at DATETIME,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES frontend_problems(id) ON DELETE CASCADE,
    FOREIGN KEY (judge_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE competitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    registration_required BOOLEAN DEFAULT TRUE,
    leaderboard_visible BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE competition_problems (
    competition_id INT,
    problem_id INT,
    order_index INT NOT NULL,
    PRIMARY KEY (competition_id, problem_id),
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

CREATE TABLE competition_participants (
    competition_id INT,
    user_id INT,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (competition_id, user_id),
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    problem_id INT,
    competition_id INT,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'pending', 'accepted', 'wrong_answer', 'time_limit_exceeded', etc.
    execution_time_ms INT,
    memory_used_kb INT,
    score INT,
    test_results JSON,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    judge_id INT, -- For manual reviews by judges
    judge_comment TEXT,
    judged_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (problem_id) REFERENCES problems(id),
    FOREIGN KEY (competition_id) REFERENCES competitions(id),
    FOREIGN KEY (judge_id) REFERENCES users(id)
);

CREATE TABLE leaderboard (
    competition_id INT,
    user_id INT,
    total_score INT DEFAULT 0,
    problems_solved INT DEFAULT 0,
    last_submission_time DATETIME,
    user_rank INT,
    PRIMARY KEY (competition_id, user_id),
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE warnings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    admin_id INT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_warnings_user_id ON warnings(user_id);
CREATE INDEX idx_warnings_admin_id ON warnings(admin_id);

ALTER TABLE warnings 
ADD CONSTRAINT fk_warnings_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE warnings 
ADD CONSTRAINT fk_warnings_admin_id 
FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE RESTRICT;

CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX idx_submissions_competition_id ON submissions(competition_id);
CREATE INDEX idx_leaderboard_competition_id ON leaderboard(competition_id);
CREATE INDEX idx_leaderboard_rank ON leaderboard(user_rank);

