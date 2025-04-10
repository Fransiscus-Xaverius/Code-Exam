-- MySQL dump 10.13  Distrib 8.0.39, for Linux (x86_64)
--
-- Host: localhost    Database: db_code_exam
-- ------------------------------------------------------
-- Server version	8.0.39-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `competition_participants`
--

DROP TABLE IF EXISTS `competition_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `competition_participants` (
  `competition_id` int NOT NULL,
  `user_id` int NOT NULL,
  `registered_at` datetime DEFAULT NULL,
  PRIMARY KEY (`competition_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `competition_participants_ibfk_1` FOREIGN KEY (`competition_id`) REFERENCES `competitions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `competition_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `competition_participants`
--

LOCK TABLES `competition_participants` WRITE;
/*!40000 ALTER TABLE `competition_participants` DISABLE KEYS */;
INSERT INTO `competition_participants` VALUES (1,1,'2025-03-14 02:30:08'),(1,2,'2025-03-13 14:58:31'),(2,1,'2025-03-14 02:28:03'),(2,2,'2025-03-14 09:38:36');
/*!40000 ALTER TABLE `competition_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `competition_problems`
--

DROP TABLE IF EXISTS `competition_problems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `competition_problems` (
  `competition_id` int NOT NULL,
  `problem_id` int NOT NULL,
  `order_index` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`competition_id`,`problem_id`),
  KEY `problem_id` (`problem_id`),
  CONSTRAINT `competition_problems_ibfk_1` FOREIGN KEY (`competition_id`) REFERENCES `competitions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `competition_problems_ibfk_2` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `competition_problems`
--

LOCK TABLES `competition_problems` WRITE;
/*!40000 ALTER TABLE `competition_problems` DISABLE KEYS */;
INSERT INTO `competition_problems` VALUES (1,1,1),(1,2,2),(1,3,3),(1,10,0);
/*!40000 ALTER TABLE `competition_problems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `competitions`
--

DROP TABLE IF EXISTS `competitions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `competitions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `is_public` tinyint(1) DEFAULT '1',
  `registration_required` tinyint(1) DEFAULT '1',
  `leaderboard_visible` tinyint(1) DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `competitions_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `competitions`
--

LOCK TABLES `competitions` WRITE;
/*!40000 ALTER TABLE `competitions` DISABLE KEYS */;
INSERT INTO `competitions` VALUES (1,'Spring Coding Challenge 2025','Join our annual Spring Coding Challenge! This competition features a variety of algorithmic problems across different difficulty levels. Perfect for students and professionals looking to sharpen their coding skills.','2025-03-15 10:00:00','2025-03-15 14:00:00',1,1,1,1,'2025-03-13 14:38:00','2025-03-13 14:38:00'),(2,'aaaaaaaaaaaaaaaa','dfsgfdgdfg','2025-03-20 08:00:00','2025-03-31 08:01:00',1,1,1,2,'2025-03-13 15:01:36','2025-03-13 15:01:47');
/*!40000 ALTER TABLE `competitions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discussion_replies`
--

DROP TABLE IF EXISTS `discussion_replies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discussion_replies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `discussion_id` int NOT NULL,
  `user_id` int NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `discussion_id` (`discussion_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `discussion_replies_ibfk_175` FOREIGN KEY (`discussion_id`) REFERENCES `submission_discussions` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `discussion_replies_ibfk_176` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discussion_replies`
--

LOCK TABLES `discussion_replies` WRITE;
/*!40000 ALTER TABLE `discussion_replies` DISABLE KEYS */;
/*!40000 ALTER TABLE `discussion_replies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leaderboard`
--

DROP TABLE IF EXISTS `leaderboard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leaderboard` (
  `competition_id` int NOT NULL,
  `user_id` int NOT NULL,
  `total_score` int DEFAULT '0',
  `problems_solved` int DEFAULT '0',
  `last_submission_time` datetime DEFAULT NULL,
  `user_rank` int DEFAULT NULL,
  PRIMARY KEY (`competition_id`,`user_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_leaderboard_rank` (`user_rank`),
  CONSTRAINT `leaderboard_ibfk_1` FOREIGN KEY (`competition_id`) REFERENCES `competitions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `leaderboard_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaderboard`
--

LOCK TABLES `leaderboard` WRITE;
/*!40000 ALTER TABLE `leaderboard` DISABLE KEYS */;
/*!40000 ALTER TABLE `leaderboard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `problems`
--

DROP TABLE IF EXISTS `problems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `difficulty` varchar(20) NOT NULL,
  `points` int NOT NULL,
  `time_limit_ms` int NOT NULL,
  `memory_limit_kb` int NOT NULL,
  `input_format` text,
  `output_format` text,
  `constraints` text,
  `sample_input` text,
  `sample_output` text,
  `hidden_test_cases` json DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `problems_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `problems_chk_1` CHECK ((`difficulty` in (_utf8mb4'Easy',_utf8mb4'Medium',_utf8mb4'Hard')))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `problems`
--

LOCK TABLES `problems` WRITE;
/*!40000 ALTER TABLE `problems` DISABLE KEYS */;
INSERT INTO `problems` VALUES (1,'Two Sum','Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.','Easy',100,1000,65536,'The first line contains an integer n, representing the size of the array.\nThe second line contains n space-separated integers representing the array elements.\nThe third line contains a single integer target.','Return two integers representing the indices of the two numbers that add up to the target.','The array size will be between 2 and 10^4.\nEach element value will be between -10^9 and 10^9.\nThe target value will be between -10^9 and 10^9.','4\n2 7 11 15\n9','0 1','[{\"input\": \"4\\n2 7 11 15\\n9\", \"output\": \"0 1\"}, {\"input\": \"3\\n3 2 4\\n6\", \"output\": \"1 2\"}, {\"input\": \"2\\n3 3\\n6\", \"output\": \"0 1\"}]',1,'2025-03-10 05:12:51','2025-03-10 05:12:51'),(2,'Longest Substring Without Repeating Characters','Given a string s, find the length of the longest substring without repeating characters.','Medium',200,2000,131072,'A single line containing a string s.','Return an integer representing the length of the longest substring without repeating characters.','The string length will be between 0 and 5 * 10^4.\nThe string consists of English letters, digits, symbols and spaces.','abcabcbb','3','[{\"input\": \"abcabcbb\", \"output\": \"3\"}, {\"input\": \"bbbbb\", \"output\": \"1\"}, {\"input\": \"pwwkew\", \"output\": \"3\"}, {\"input\": \"\", \"output\": \"0\"}]',1,'2025-03-10 05:12:51','2025-03-10 05:12:51'),(3,'Merge K Sorted Lists','You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.','Hard',300,3000,262144,'The first line contains an integer k, representing the number of linked lists.\nEach of the next k lines contains a space-separated list of integers representing a sorted linked list.','Return a single line of space-separated integers representing the merged sorted linked list.','k is between 0 and 10^4.\nThe total number of nodes across all lists is between 0 and 10^4.\nEach node value is between -10^4 and 10^4.','3\n1 4 5\n1 3 4\n2 6','1 1 2 3 4 4 5 6','[{\"input\": \"3\\n1 4 5\\n1 3 4\\n2 6\", \"output\": \"1 1 2 3 4 4 5 6\"}, {\"input\": \"2\\n1 2 3\\n4 5 6\", \"output\": \"1 2 3 4 5 6\"}, {\"input\": \"0\\n\", \"output\": \"\"}]',1,'2025-03-10 05:12:51','2025-03-10 05:12:51'),(4,'Valid Parentheses','Given a string s containing just the characters \'(\' , \')\' , \'{\' , \'}\' , \'[\' and \']\', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.','Easy',100,1000,65536,'A single line containing a string s consisting of parentheses characters.','Return \"true\" if the string is valid, and \"false\" otherwise.','The string length will be between 1 and 10^4.\nThe string will only contain characters \'(\' , \')\' , \'{\' , \'}\' , \'[\' and \']\'.','()[]{}','true','[{\"input\": \"()[]{}\", \"output\": \"true\"}, {\"input\": \"(]\", \"output\": \"false\"}, {\"input\": \"([)]\", \"output\": \"false\"}, {\"input\": \"{[]}\", \"output\": \"true\"}]',1,'2025-03-10 05:12:51','2025-03-10 05:12:51'),(5,'Binary Tree Inorder Traversal','Given the root of a binary tree, return the inorder traversal of its nodes\' values.','Medium',200,2000,131072,'The first line contains an integer n, representing the number of nodes in the binary tree.\nThe second line contains n space-separated integers representing the values of the nodes.\nThe third line contains n space-separated integers representing the parent indices of each node (-1 for the root).','Return a single line of space-separated integers representing the inorder traversal of the binary tree.','The number of nodes in the tree will be between 0 and 100.\nEach node value will be between -100 and 100.','3\n1 2 3\n-1 0 0','2 1 3','[{\"input\": \"3\\n1 2 3\\n-1 0 0\", \"output\": \"2 1 3\"}, {\"input\": \"1\\n1\\n-1\", \"output\": \"1\"}, {\"input\": \"0\\n\\n\", \"output\": \"\"}]',1,'2025-03-10 05:12:51','2025-03-10 05:12:51'),(6,'Minimum Path Sum','Given a m x n grid filled with non-negative numbers, find a path from top left to bottom right, which minimizes the sum of all numbers along its path. You can only move either down or right at any point in time.','Medium',200,2000,131072,'The first line contains two integers m and n, representing the dimensions of the grid.\nEach of the next m lines contains n space-separated integers representing the values in the grid.','Return a single integer representing the minimum path sum.','The grid dimensions m and n will be between 1 and 200.\nEach value in the grid will be between 0 and 100.','3 3\n1 3 1\n1 5 1\n4 2 1','7','[{\"input\": \"3 3\\n1 3 1\\n1 5 1\\n4 2 1\", \"output\": \"7\"}, {\"input\": \"2 3\\n1 2 3\\n4 5 6\", \"output\": \"12\"}, {\"input\": \"1 1\\n1\", \"output\": \"1\"}]',1,'2025-03-10 05:12:51','2025-03-10 05:12:51'),(7,'Trapping Rain Water','Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.','Hard',300,3000,262144,'The first line contains an integer n, representing the size of the elevation map.\nThe second line contains n space-separated integers representing the heights of the bars.','Return a single integer representing the amount of water that can be trapped.','The array size will be between 1 and 2 * 10^4.\nEach height will be between 0 and 10^5.','12\n0 1 0 2 1 0 1 3 2 1 2 1','6','[{\"input\": \"12\\n0 1 0 2 1 0 1 3 2 1 2 1\", \"output\": \"6\"}, {\"input\": \"6\\n4 2 0 3 2 5\", \"output\": \"9\"}, {\"input\": \"1\\n0\", \"output\": \"0\"}]',1,'2025-03-10 05:12:51','2025-03-10 05:12:51'),(8,'LRU Cache','Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get and put operations.','Hard',300,3000,262144,'The first line contains an integer n, representing the capacity of the LRU cache.\nThe second line contains an integer m, representing the number of operations.\nEach of the next m lines contains an operation in the format \"get key\" or \"put key value\".','For each \"get\" operation, return the value of the key if it exists, or -1 if it doesn\'t.\nFor each \"put\" operation, no output is required.','The capacity will be between 1 and 3000.\nThe number of operations will be between 1 and 3 * 10^4.\nEach key and value will be between 0 and 10^4.','2\n7\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nput 4 4\nget 1','1\n-1\n-1','[{\"input\": \"2\\n7\\nput 1 1\\nput 2 2\\nget 1\\nput 3 3\\nget 2\\nput 4 4\\nget 1\", \"output\": \"1\\n-1\\n-1\"}, {\"input\": \"1\\n3\\nput 1 1\\nput 2 2\\nget 1\", \"output\": \"-1\"}]',1,'2025-03-10 05:12:51','2025-03-10 05:12:51'),(9,'Word Search','Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.','Medium',200,2000,131072,'The first line contains two integers m and n, representing the dimensions of the board.\nEach of the next m lines contains n space-separated characters representing the board.\nThe last line contains a string word.','Return \"true\" if the word exists in the grid, and \"false\" otherwise.','The board dimensions m and n will be between 1 and 6.\nThe word length will be between 1 and 15.\nThe board and word will only consist of lowercase and uppercase English letters.','3 4\nA B C E\nS F C S\nA D E E\nSEE','true','[{\"input\": \"3 4\\nA B C E\\nS F C S\\nA D E E\\nSEE\", \"output\": \"true\"}, {\"input\": \"3 4\\nA B C E\\nS F C S\\nA D E E\\nABCB\", \"output\": \"false\"}, {\"input\": \"1 1\\nA\\nA\", \"output\": \"true\"}]',1,'2025-03-10 05:12:51','2025-03-10 05:12:51'),(10,'tessaaa','tes','Medium',100,1000,262144,'tes','tes','tes','tes','tes','\"tes\"',1,'2025-03-11 14:37:53','2025-03-27 14:40:39');
/*!40000 ALTER TABLE `problems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submission_discussions`
--

DROP TABLE IF EXISTS `submission_discussions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submission_discussions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `submission_discussions_ibfk_185` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `submission_discussions_ibfk_186` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submission_discussions`
--

LOCK TABLES `submission_discussions` WRITE;
/*!40000 ALTER TABLE `submission_discussions` DISABLE KEYS */;
INSERT INTO `submission_discussions` VALUES (1,18,1,'test','test','2025-03-27 15:37:45','2025-03-27 15:37:45');
/*!40000 ALTER TABLE `submission_discussions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `problem_id` int DEFAULT NULL,
  `competition_id` int DEFAULT NULL,
  `code` text NOT NULL,
  `language` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `execution_time_ms` int DEFAULT NULL,
  `memory_used_kb` int DEFAULT NULL,
  `score` float DEFAULT NULL,
  `test_results` json DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `judge_id` int DEFAULT NULL,
  `judge_comment` text,
  `judged_at` datetime DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `problem_id` (`problem_id`),
  KEY `competition_id` (`competition_id`),
  KEY `judge_id` (`judge_id`),
  CONSTRAINT `submissions_ibfk_303` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `submissions_ibfk_304` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `submissions_ibfk_305` FOREIGN KEY (`competition_id`) REFERENCES `competitions` (`id`),
  CONSTRAINT `submissions_ibfk_306` FOREIGN KEY (`judge_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
INSERT INTO `submissions` VALUES (1,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  console.log(\'hello\');\n}\n','javascript','pending',NULL,NULL,NULL,NULL,'2025-03-20 15:37:05',NULL,NULL,NULL,0,'2025-03-20 15:37:05','2025-03-20 15:37:05'),(2,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  console.log(\'hello too\')\n}\n','javascript','pending',NULL,NULL,NULL,NULL,'2025-03-27 14:50:36',NULL,NULL,NULL,0,'2025-03-27 14:50:36','2025-03-27 14:50:36'),(3,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  console.log(\'hello three\')\n}\n','javascript','accepted',NULL,NULL,NULL,NULL,'2025-03-27 14:53:16',NULL,NULL,NULL,0,'2025-03-27 14:53:16','2025-03-27 14:53:16'),(4,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  console.log(\'bruh\')\n}\n','javascript','accepted',NULL,NULL,NULL,NULL,'2025-03-27 14:54:19',NULL,NULL,NULL,0,'2025-03-27 14:54:19','2025-03-27 14:54:19'),(5,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  console.log(\'hello\')\n}\n','javascript','accepted',NULL,NULL,NULL,NULL,'2025-03-27 14:55:41',NULL,NULL,NULL,0,'2025-03-27 14:55:41','2025-03-27 14:55:41'),(6,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  console.log(\'hello\')\n}\n','javascript','accepted',NULL,NULL,NULL,NULL,'2025-03-27 14:55:45',NULL,NULL,NULL,0,'2025-03-27 14:55:45','2025-03-27 14:55:45'),(7,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  console.log(\'hello\')\n}\n','javascript','accepted',NULL,NULL,NULL,NULL,'2025-03-27 14:56:16',NULL,NULL,NULL,0,'2025-03-27 14:56:16','2025-03-27 14:56:16'),(8,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  tes();\n}\n','javascript','accepted',NULL,NULL,NULL,NULL,'2025-03-27 14:57:20',NULL,NULL,NULL,0,'2025-03-27 14:57:20','2025-03-27 14:57:20'),(9,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  tes()\n}\n','javascript','accepted',NULL,NULL,NULL,NULL,'2025-03-27 14:57:44',NULL,NULL,NULL,0,'2025-03-27 14:57:44','2025-03-27 14:57:44'),(10,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  test()\n}\n','javascript','accepted',NULL,NULL,NULL,NULL,'2025-03-27 14:58:18',NULL,NULL,NULL,0,'2025-03-27 14:58:18','2025-03-27 14:58:18'),(11,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  test()\n}\n','javascript','accepted',NULL,NULL,NULL,NULL,'2025-03-27 14:58:31',NULL,NULL,NULL,0,'2025-03-27 14:58:31','2025-03-27 14:58:31'),(12,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  test()\n}\n','javascript','accepted',NULL,NULL,NULL,NULL,'2025-03-27 15:02:19',NULL,NULL,NULL,0,'2025-03-27 15:02:19','2025-03-27 15:02:19'),(13,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  test()\n}\n','javascript','accepted',NULL,NULL,NULL,NULL,'2025-03-27 15:04:50',NULL,NULL,NULL,0,'2025-03-27 15:04:50','2025-03-27 15:04:50'),(14,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  test();\n}\n','javascript','accepted',NULL,NULL,NULL,NULL,'2025-03-27 15:09:33',NULL,NULL,NULL,0,'2025-03-27 15:09:33','2025-03-27 15:09:33'),(15,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  test();\n}\n','javascript','accepted',NULL,NULL,NULL,NULL,'2025-03-27 15:09:46',NULL,NULL,NULL,0,'2025-03-27 15:09:46','2025-03-27 15:09:46'),(16,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  test()\n}\n','javascript','accepted',NULL,NULL,NULL,NULL,'2025-03-27 15:10:04',NULL,NULL,NULL,0,'2025-03-27 15:10:04','2025-03-27 15:10:04'),(17,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  tes();\n}\n','javascript','accepted',NULL,NULL,NULL,NULL,'2025-03-27 15:22:57',NULL,NULL,NULL,0,'2025-03-27 15:22:57','2025-03-27 15:22:57'),(18,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  tes();\n  tes();\n  tes();\n  tes();\n  tes();\n  tes();\n  tes();\n  tes();\n  tes();\n  tes();\n  tes();\n  tes();\n  tes();\n  tes();\n  tes();tes();tes();tes();tes();tes();tes();tes();tes();tes();tes();tes();tes();tes();tes();tes();tes();tes();tes();tes();\n  tes();\n  tes();\n  tes();\n  tes();\n  tes();\n  tes();\n  tes();\n  visualViewport();\n}\n','javascript','accepted',NULL,NULL,NULL,NULL,'2025-03-27 15:23:26',NULL,NULL,NULL,1,'2025-03-27 15:23:26','2025-03-27 15:35:28'),(19,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','javascript','accepted',NULL,NULL,NULL,NULL,'2025-03-27 15:58:45',NULL,NULL,NULL,0,'2025-03-27 15:58:45','2025-03-27 15:58:45'),(20,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','javascript','accepted',NULL,NULL,NULL,NULL,'2025-03-27 15:59:20',NULL,NULL,NULL,0,'2025-03-27 15:59:20','2025-03-27 15:59:20'),(21,2,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','pending',NULL,NULL,NULL,NULL,'2025-03-27 16:19:29',NULL,NULL,NULL,0,'2025-03-27 16:19:29','2025-03-27 16:19:29'),(22,2,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','pending',NULL,NULL,NULL,NULL,'2025-03-27 16:20:14',NULL,NULL,NULL,0,'2025-03-27 16:20:14','2025-03-27 16:20:14'),(23,2,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','pending',NULL,NULL,NULL,NULL,'2025-03-27 16:21:28',NULL,NULL,NULL,0,'2025-03-27 16:21:28','2025-03-27 16:21:28'),(24,2,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  console.log(3)\n}\n','63','pending',NULL,NULL,NULL,NULL,'2025-03-27 16:22:10',NULL,NULL,NULL,0,'2025-03-27 16:22:10','2025-03-27 16:22:10'),(25,2,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  console.log(3)\n}\n','63','pending',NULL,NULL,NULL,NULL,'2025-03-27 16:24:03',NULL,NULL,NULL,0,'2025-03-27 16:24:03','2025-03-27 16:24:03'),(26,2,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  console.log(3)\n}\n','63','pending',NULL,NULL,NULL,NULL,'2025-03-27 16:24:52',NULL,NULL,NULL,0,'2025-03-27 16:24:52','2025-03-27 16:24:52'),(27,2,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  console.log(3)\n}\n','63','runtime_error',NULL,NULL,NULL,NULL,'2025-03-27 16:37:41',NULL,'Problem configuration error: No valid test cases found.',NULL,0,'2025-03-27 16:37:41','2025-03-27 16:37:41'),(28,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','pending',NULL,NULL,NULL,NULL,'2025-03-27 16:38:26',NULL,NULL,NULL,0,'2025-03-27 16:38:26','2025-03-27 16:38:26'),(29,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','pending',NULL,NULL,NULL,NULL,'2025-03-27 16:40:55',NULL,NULL,NULL,0,'2025-03-27 16:40:55','2025-03-27 16:40:55'),(30,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','pending',NULL,NULL,NULL,NULL,'2025-03-27 16:41:50',NULL,NULL,NULL,0,'2025-03-27 16:41:50','2025-03-27 16:41:50'),(31,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','pending',NULL,NULL,NULL,NULL,'2025-03-27 16:42:36',NULL,NULL,NULL,0,'2025-03-27 16:42:36','2025-03-27 16:42:36'),(32,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','pending',NULL,NULL,NULL,NULL,'2025-03-27 16:45:11',NULL,NULL,NULL,0,'2025-03-27 16:45:11','2025-03-27 16:45:11'),(33,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','pending',NULL,NULL,NULL,NULL,'2025-03-27 16:59:57',NULL,NULL,NULL,0,'2025-03-27 16:59:57','2025-03-27 16:59:57'),(34,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','accepted',NULL,NULL,100,'\"[{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.167,\\\"memory_kb\\\":6760,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.198,\\\"memory_kb\\\":6784,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.138,\\\"memory_kb\\\":6964,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null}]\"','2025-03-27 17:09:36',NULL,NULL,NULL,0,'2025-03-27 17:09:36','2025-03-27 17:09:41'),(35,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','accepted',NULL,NULL,100,'\"[{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.342,\\\"memory_kb\\\":6688,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.303,\\\"memory_kb\\\":6824,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.262,\\\"memory_kb\\\":6784,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null}]\"','2025-03-27 17:10:21',NULL,NULL,NULL,0,'2025-03-27 17:10:21','2025-03-27 17:10:28'),(36,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','accepted',NULL,NULL,100,'\"[{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.371,\\\"memory_kb\\\":6588,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.289,\\\"memory_kb\\\":6724,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.215,\\\"memory_kb\\\":6644,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null}]\"','2025-03-27 17:10:28',NULL,NULL,NULL,0,'2025-03-27 17:10:28','2025-03-27 17:10:34'),(37,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','accepted',NULL,NULL,100,'\"[{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.133,\\\"memory_kb\\\":6528,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.15,\\\"memory_kb\\\":6688,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.156,\\\"memory_kb\\\":6624,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null}]\"','2025-03-27 17:11:02',NULL,NULL,NULL,0,'2025-03-27 17:11:02','2025-03-27 17:11:07'),(38,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','accepted',NULL,NULL,100,'\"[{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.212,\\\"memory_kb\\\":6660,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.197,\\\"memory_kb\\\":6552,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.109,\\\"memory_kb\\\":6728,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null}]\"','2025-03-27 17:12:53',NULL,NULL,NULL,0,'2025-03-27 17:12:53','2025-03-27 17:12:56'),(39,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','accepted',NULL,NULL,100,'\"[{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.211,\\\"memory_kb\\\":6512,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.209,\\\"memory_kb\\\":6488,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.243,\\\"memory_kb\\\":6664,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null}]\"','2025-03-27 17:13:15',NULL,NULL,NULL,0,'2025-03-27 17:13:15','2025-03-27 17:13:19'),(40,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','accepted',NULL,NULL,100,'\"[{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.094,\\\"memory_kb\\\":6820,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.126,\\\"memory_kb\\\":6732,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.092,\\\"memory_kb\\\":6496,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null}]\"','2025-03-27 17:13:36',NULL,NULL,NULL,0,'2025-03-27 17:13:36','2025-03-27 17:13:39'),(41,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','accepted',NULL,NULL,100,'\"[{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.204,\\\"memory_kb\\\":6744,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.117,\\\"memory_kb\\\":6660,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.122,\\\"memory_kb\\\":6724,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null}]\"','2025-03-27 17:15:58',NULL,NULL,NULL,0,'2025-03-27 17:15:58','2025-03-27 17:16:02'),(42,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','accepted',NULL,NULL,100,'\"[{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.053,\\\"memory_kb\\\":6788,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.063,\\\"memory_kb\\\":6996,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.061,\\\"memory_kb\\\":6688,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null}]\"','2025-03-27 17:17:18',NULL,NULL,NULL,0,'2025-03-27 17:17:18','2025-03-27 17:17:20'),(43,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','accepted',NULL,NULL,100,'\"[{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.21,\\\"memory_kb\\\":6828,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.225,\\\"memory_kb\\\":6656,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.181,\\\"memory_kb\\\":6528,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null}]\"','2025-03-27 17:18:41',NULL,NULL,NULL,0,'2025-03-27 17:18:41','2025-03-27 17:18:45'),(44,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','accepted',NULL,NULL,100,'\"[{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.08,\\\"memory_kb\\\":6720,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.069,\\\"memory_kb\\\":6696,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.071,\\\"memory_kb\\\":6628,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null}]\"','2025-03-27 17:19:47',NULL,NULL,NULL,0,'2025-03-27 17:19:47','2025-03-27 17:19:50'),(45,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','pending',NULL,NULL,NULL,NULL,'2025-03-27 17:20:18',NULL,NULL,NULL,0,'2025-03-27 17:20:18','2025-03-27 17:20:18'),(46,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','pending',NULL,NULL,NULL,NULL,'2025-03-27 17:24:54',NULL,NULL,NULL,0,'2025-03-27 17:24:54','2025-03-27 17:24:54'),(47,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','wrong_answer',NULL,NULL,0,'\"[{\\\"passed\\\":false,\\\"error\\\":\\\"Wrong Answer\\\",\\\"runtime_ms\\\":0.222,\\\"memory_kb\\\":6508,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":false,\\\"error\\\":\\\"Wrong Answer\\\",\\\"runtime_ms\\\":0.185,\\\"memory_kb\\\":6748,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":false,\\\"error\\\":\\\"Wrong Answer\\\",\\\"runtime_ms\\\":0.187,\\\"memory_kb\\\":6612,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null}]\"','2025-03-27 17:29:26',NULL,NULL,NULL,0,'2025-03-27 17:29:26','2025-03-27 17:29:31'),(48,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','wrong_answer',NULL,NULL,0,'\"[{\\\"passed\\\":false,\\\"error\\\":\\\"Wrong Answer\\\",\\\"runtime_ms\\\":0.222,\\\"memory_kb\\\":6688,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":false,\\\"error\\\":\\\"Wrong Answer\\\",\\\"runtime_ms\\\":0.255,\\\"memory_kb\\\":6492,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":false,\\\"error\\\":\\\"Wrong Answer\\\",\\\"runtime_ms\\\":0.197,\\\"memory_kb\\\":7148,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null}]\"','2025-03-27 17:30:47',NULL,NULL,NULL,0,'2025-03-27 17:30:47','2025-03-27 17:30:53'),(49,2,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  console.log(\'aaaa\')\n}\n','63','wrong_answer',NULL,NULL,0,'\"[{\\\"passed\\\":false,\\\"error\\\":\\\"Wrong Answer\\\",\\\"runtime_ms\\\":0.074,\\\"memory_kb\\\":14576,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":false,\\\"error\\\":\\\"Wrong Answer\\\",\\\"runtime_ms\\\":0.082,\\\"memory_kb\\\":16888,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":false,\\\"error\\\":\\\"Wrong Answer\\\",\\\"runtime_ms\\\":0.084,\\\"memory_kb\\\":15820,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":null}]\"','2025-03-28 07:19:06',NULL,NULL,NULL,0,'2025-03-28 07:19:06','2025-03-28 07:19:08'),(50,2,1,NULL,'#include <iostream>\n#include <vector>\n#include <unordered_map>\n\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> map; // stores the number and its index\n\n    // Iterate through the vector\n    for (int i = 0; i < nums.size(); i++) {\n        int complement = target - nums[i]; // Find the complement\n\n        // Check if complement exists in the map\n        if (map.find(complement) != map.end()) {\n            // If found, return the indices\n            return {map[complement], i};\n        }\n        \n        // Otherwise, store the current number and its index in the map\n        map[nums[i]] = i;\n    }\n\n    return {}; // If no solution, return empty vector (shouldn\'t happen as per problem statement)\n}\n\nint main() {\n    int n, target;\n    // cout << \"Enter the size of the array: \";\n    cin >> n;\n    vector<int> nums(n);\n    \n    // cout << \"Enter the elements of the array: \";\n    for (int i = 0; i < n; i++) {\n        cin >> nums[i];\n    }\n\n    // cout << \"Enter the target value: \";\n    cin >> target;\n    \n    vector<int> result = twoSum(nums, target);\n    \n    // Output the result\n    if (!result.empty()) {\n        cout << result[0] << result[1] << endl;\n    } else {\n    }\n\n    return 0;\n}\n','63','wrong_answer',NULL,NULL,0,'\"[{\\\"passed\\\":false,\\\"error\\\":\\\"Runtime Error (NZEC)\\\",\\\"runtime_ms\\\":0.068,\\\"memory_kb\\\":6840,\\\"stdout\\\":null,\\\"stderr\\\":\\\"/box/script.js:1\\\\n#include <iostream>\\\\n^^^^^^^^\\\\n\\\\nSyntaxError: Unexpected identifier\\\\n    at Module._compile (internal/modules/cjs/loader.js:895:18)\\\\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:995:10)\\\\n    at Module.load (internal/modules/cjs/loader.js:815:32)\\\\n    at Function.Module._load (internal/modules/cjs/loader.js:727:14)\\\\n    at Function.Module.runMain (internal/modules/cjs/loader.js:1047:10)\\\\n    at internal/main/run_main_module.js:17:11\\\\n\\\",\\\"compile_output\\\":null},{\\\"passed\\\":false,\\\"error\\\":\\\"Runtime Error (NZEC)\\\",\\\"runtime_ms\\\":0.064,\\\"memory_kb\\\":6904,\\\"stdout\\\":null,\\\"stderr\\\":\\\"/box/script.js:1\\\\n#include <iostream>\\\\n^^^^^^^^\\\\n\\\\nSyntaxError: Unexpected identifier\\\\n    at Module._compile (internal/modules/cjs/loader.js:895:18)\\\\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:995:10)\\\\n    at Module.load (internal/modules/cjs/loader.js:815:32)\\\\n    at Function.Module._load (internal/modules/cjs/loader.js:727:14)\\\\n    at Function.Module.runMain (internal/modules/cjs/loader.js:1047:10)\\\\n    at internal/main/run_main_module.js:17:11\\\\n\\\",\\\"compile_output\\\":null},{\\\"passed\\\":false,\\\"error\\\":\\\"Runtime Error (NZEC)\\\",\\\"runtime_ms\\\":0.055,\\\"memory_kb\\\":6752,\\\"stdout\\\":null,\\\"stderr\\\":\\\"/box/script.js:1\\\\n#include <iostream>\\\\n^^^^^^^^\\\\n\\\\nSyntaxError: Unexpected identifier\\\\n    at Module._compile (internal/modules/cjs/loader.js:895:18)\\\\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:995:10)\\\\n    at Module.load (internal/modules/cjs/loader.js:815:32)\\\\n    at Function.Module._load (internal/modules/cjs/loader.js:727:14)\\\\n    at Function.Module.runMain (internal/modules/cjs/loader.js:1047:10)\\\\n    at internal/main/run_main_module.js:17:11\\\\n\\\",\\\"compile_output\\\":null}]\"','2025-03-28 07:21:51',NULL,NULL,NULL,0,'2025-03-28 07:21:51','2025-03-28 07:21:54'),(51,2,1,NULL,'#include <iostream>\n#include <vector>\n#include <unordered_map>\n\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> map; // stores the number and its index\n\n    // Iterate through the vector\n    for (int i = 0; i < nums.size(); i++) {\n        int complement = target - nums[i]; // Find the complement\n\n        // Check if complement exists in the map\n        if (map.find(complement) != map.end()) {\n            // If found, return the indices\n            return {map[complement], i};\n        }\n        \n        // Otherwise, store the current number and its index in the map\n        map[nums[i]] = i;\n    }\n\n    return {}; // If no solution, return empty vector (shouldn\'t happen as per problem statement)\n}\n\nint main() {\n    int n, target;\n    // cout << \"Enter the size of the array: \";\n    cin >> n;\n    vector<int> nums(n);\n    \n    // cout << \"Enter the elements of the array: \";\n    for (int i = 0; i < n; i++) {\n        cin >> nums[i];\n    }\n\n    // cout << \"Enter the target value: \";\n    cin >> target;\n    \n    vector<int> result = twoSum(nums, target);\n    \n    // Output the result\n    if (!result.empty()) {\n        cout << result[0] << result[1] << endl;\n    } else {\n    }\n\n    return 0;\n}\n','54','wrong_answer',NULL,NULL,0,'\"[{\\\"passed\\\":false,\\\"error\\\":\\\"Wrong Answer\\\",\\\"runtime_ms\\\":0.004,\\\"memory_kb\\\":8708,\\\"stdout\\\":\\\"01\\\\n\\\",\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":false,\\\"error\\\":\\\"Wrong Answer\\\",\\\"runtime_ms\\\":0.005,\\\"memory_kb\\\":17936,\\\"stdout\\\":\\\"12\\\\n\\\",\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":false,\\\"error\\\":\\\"Wrong Answer\\\",\\\"runtime_ms\\\":0.004,\\\"memory_kb\\\":10860,\\\"stdout\\\":\\\"01\\\\n\\\",\\\"stderr\\\":null,\\\"compile_output\\\":null}]\"','2025-03-28 07:23:41',NULL,NULL,NULL,0,'2025-03-28 07:23:41','2025-03-28 07:23:45'),(52,2,1,NULL,'#include <iostream>\n#include <vector>\n#include <unordered_map>\n\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> map; // stores the number and its index\n\n    // Iterate through the vector\n    for (int i = 0; i < nums.size(); i++) {\n        int complement = target - nums[i]; // Find the complement\n\n        // Check if complement exists in the map\n        if (map.find(complement) != map.end()) {\n            // If found, return the indices\n            return {map[complement], i};\n        }\n        \n        // Otherwise, store the current number and its index in the map\n        map[nums[i]] = i;\n    }\n\n    return {}; // If no solution, return empty vector (shouldn\'t happen as per problem statement)\n}\n\nint main() {\n    int n, target;\n    // cout << \"Enter the size of the array: \";\n    cin >> n;\n    vector<int> nums(n);\n    \n    // cout << \"Enter the elements of the array: \";\n    for (int i = 0; i < n; i++) {\n        cin >> nums[i];\n    }\n\n    // cout << \"Enter the target value: \";\n    cin >> target;\n    \n    vector<int> result = twoSum(nums, target);\n    \n    // Output the result\n    if (!result.empty()) {\n        cout << result[0] << result[1] << endl;\n    } else {\n    }\n\n    return 0;\n}\n','54','wrong_answer',NULL,NULL,0,'\"[{\\\"passed\\\":false,\\\"error\\\":\\\"Wrong Answer\\\",\\\"runtime_ms\\\":0.004,\\\"memory_kb\\\":1216,\\\"stdout\\\":\\\"01\\\\n\\\",\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":false,\\\"error\\\":\\\"Wrong Answer\\\",\\\"runtime_ms\\\":0.004,\\\"memory_kb\\\":984,\\\"stdout\\\":\\\"12\\\\n\\\",\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":false,\\\"error\\\":\\\"Wrong Answer\\\",\\\"runtime_ms\\\":0.004,\\\"memory_kb\\\":984,\\\"stdout\\\":\\\"01\\\\n\\\",\\\"stderr\\\":null,\\\"compile_output\\\":null}]\"','2025-03-28 07:25:59',NULL,NULL,NULL,0,'2025-03-28 07:25:59','2025-03-28 07:26:02'),(53,2,1,NULL,'#include <iostream>\n#include <vector>\n#include <unordered_map>\n\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> map; // stores the number and its index\n\n    // Iterate through the vector\n    for (int i = 0; i < nums.size(); i++) {\n        int complement = target - nums[i]; // Find the complement\n\n        // Check if complement exists in the map\n        if (map.find(complement) != map.end()) {\n            // If found, return the indices\n            return {map[complement], i};\n        }\n        \n        // Otherwise, store the current number and its index in the map\n        map[nums[i]] = i;\n    }\n\n    return {}; // If no solution, return empty vector (shouldn\'t happen as per problem statement)\n}\n\nint main() {\n    int n, target;\n    // cout << \"Enter the size of the array: \";\n    cin >> n;\n    vector<int> nums(n);\n    \n    // cout << \"Enter the elements of the array: \";\n    for (int i = 0; i < n; i++) {\n        cin >> nums[i];\n    }\n\n    // cout << \"Enter the target value: \";\n    cin >> target;\n    \n    vector<int> result = twoSum(nums, target);\n    \n    // Output the result\n    if (!result.empty()) {\n        cout << result[0] << \" \" << result[1];\n    } else {\n    }\n\n    return 0;\n}\n','54','accepted',NULL,NULL,100,'\"[{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.005,\\\"memory_kb\\\":1444,\\\"stdout\\\":\\\"0 1\\\",\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.004,\\\"memory_kb\\\":988,\\\"stdout\\\":\\\"1 2\\\",\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.005,\\\"memory_kb\\\":984,\\\"stdout\\\":\\\"0 1\\\",\\\"stderr\\\":null,\\\"compile_output\\\":null}]\"','2025-03-28 07:27:01',NULL,NULL,NULL,0,'2025-03-28 07:27:01','2025-03-28 07:27:03'),(54,2,1,NULL,'#include <iostream>\n#include <vector>\n#include <unordered_map>\n\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> map; // stores the number and its index\n\n    // Iterate through the vector\n    for (int i = 0; i < nums.size(); i++) {\n        int complement = target - nums[i]; // Find the complement\n\n        // Check if complement exists in the map\n        if (map.find(complement) != map.end()) {\n            // If found, return the indices\n            return {map[complement], i};\n        }\n        \n        // Otherwise, store the current number and its index in the map\n        map[nums[i]] = i;\n    }\n\n    return {}; // If no solution, return empty vector (shouldn\'t happen as per problem statement)\n}\n\nint main() {\n    int n, target;\n    // cout << \"Enter the size of the array: \";\n    cin >> n;\n    vector<int> nums(n);\n    \n    // cout << \"Enter the elements of the array: \";\n    for (int i = 0; i < n; i++) {\n        cin >> nums[i];\n    }\n\n    // cout << \"Enter the target value: \";\n    cin >> target;\n    \n    vector<int> result = twoSum(nums, target);\n    \n    // Output the result\n    if (!result.empty()) {\n        cout << result[0] << \" \" << result[1];\n    } else {\n    }\n\n    return 0;\n}\n','54','accepted',NULL,NULL,100,'\"[{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.007,\\\"memory_kb\\\":988,\\\"stdout\\\":\\\"0 1\\\",\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.004,\\\"memory_kb\\\":984,\\\"stdout\\\":\\\"1 2\\\",\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.006,\\\"memory_kb\\\":984,\\\"stdout\\\":\\\"0 1\\\",\\\"stderr\\\":null,\\\"compile_output\\\":null}]\"','2025-03-28 09:29:48',NULL,NULL,NULL,0,'2025-03-28 09:29:48','2025-03-28 09:29:51'),(55,2,1,NULL,'// #include <iostream>\n// #include <vector>\n// #include <unordered_map>\n\n// using namespace std;\n\n// vector<int> twoSum(vector<int>& nums, int target) {\n//     unordered_map<int, int> map; // stores the number and its index\n\n//     // Iterate through the vector\n//     for (int i = 0; i < nums.size(); i++) {\n//         int complement = target - nums[i]; // Find the complement\n\n//         // Check if complement exists in the map\n//         if (map.find(complement) != map.end()) {\n//             // If found, return the indices\n//             return {map[complement], i};\n//         }\n        \n//         // Otherwise, store the current number and its index in the map\n//         map[nums[i]] = i;\n//     }\n\n//     return {}; // If no solution, return empty vector (shouldn\'t happen as per problem statement)\n// }\n\n// int main() {\n//     int n, target;\n//     // cout << \"Enter the size of the array: \";\n//     cin >> n;\n//     vector<int> nums(n);\n    \n//     // cout << \"Enter the elements of the array: \";\n//     for (int i = 0; i < n; i++) {\n//         cin >> nums[i];\n//     }\n\n//     // cout << \"Enter the target value: \";\n//     cin >> target;\n    \n//     vector<int> result = twoSum(nums, target);\n    \n//     // Output the result\n//     if (!result.empty()) {\n//         cout << result[0] << \" \" << result[1];\n//     } else {\n//     }\n\n//     return 0;\n// }\n','54','wrong_answer',NULL,NULL,0,'\"[{\\\"passed\\\":false,\\\"error\\\":\\\"Compilation Error\\\",\\\"runtime_ms\\\":0,\\\"memory_kb\\\":0,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":\\\"/usr/bin/ld: /usr/lib/x86_64-linux-gnu/crt1.o: in function `_start\':\\\\n(.text+0x20): undefined reference to `main\'\\\\ncollect2: error: ld returned 1 exit status\\\\n\\\"},{\\\"passed\\\":false,\\\"error\\\":\\\"Compilation Error\\\",\\\"runtime_ms\\\":0,\\\"memory_kb\\\":0,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":\\\"/usr/bin/ld: /usr/lib/x86_64-linux-gnu/crt1.o: in function `_start\':\\\\n(.text+0x20): undefined reference to `main\'\\\\ncollect2: error: ld returned 1 exit status\\\\n\\\"},{\\\"passed\\\":false,\\\"error\\\":\\\"Compilation Error\\\",\\\"runtime_ms\\\":0,\\\"memory_kb\\\":0,\\\"stdout\\\":null,\\\"stderr\\\":null,\\\"compile_output\\\":\\\"/usr/bin/ld: /usr/lib/x86_64-linux-gnu/crt1.o: in function `_start\':\\\\n(.text+0x20): undefined reference to `main\'\\\\ncollect2: error: ld returned 1 exit status\\\\n\\\"}]\"','2025-03-28 09:30:41',NULL,NULL,NULL,0,'2025-03-28 09:30:41','2025-03-28 09:30:44'),(56,2,1,NULL,'#include <iostream>\n#include <vector>\n#include <unordered_map>\n\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> map; // stores the number and its index\n\n    // Iterate through the vector\n    for (int i = 0; i < nums.size(); i++) {\n        int complement = target - nums[i]; // Find the complement\n\n        // Check if complement exists in the map\n        if (map.find(complement) != map.end()) {\n            // If found, return the indices\n            return {map[complement], i};\n        }\n        \n        // Otherwise, store the current number and its index in the map\n        map[nums[i]] = i;\n    }\n\n    return {}; // If no solution, return empty vector (shouldn\'t happen as per problem statement)\n}\n\nint main() {\n    int n, target;\n    // cout << \"Enter the size of the array: \";\n    cin >> n;\n    vector<int> nums(n);\n    \n    // cout << \"Enter the elements of the array: \";\n    for (int i = 0; i < n; i++) {\n        cin >> nums[i];\n    }\n\n    // cout << \"Enter the target value: \";\n    cin >> target;\n    \n    vector<int> result = twoSum(nums, target);\n    \n    // Output the result\n    if (!result.empty()) {\n        cout << result[0] << \" \" << result[1];\n    } else {\n    }\n\n    return 0;\n}','54','accepted',NULL,NULL,100,'\"[{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.005,\\\"memory_kb\\\":984,\\\"stdout\\\":\\\"0 1\\\",\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.005,\\\"memory_kb\\\":984,\\\"stdout\\\":\\\"1 2\\\",\\\"stderr\\\":null,\\\"compile_output\\\":null},{\\\"passed\\\":true,\\\"error\\\":null,\\\"runtime_ms\\\":0.006,\\\"memory_kb\\\":1128,\\\"stdout\\\":\\\"0 1\\\",\\\"stderr\\\":null,\\\"compile_output\\\":null}]\"','2025-03-28 09:45:46',NULL,NULL,NULL,0,'2025-03-28 09:45:46','2025-03-28 09:45:50'),(57,1,10,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  console.log(tes);\n}\n','63','runtime_error',NULL,NULL,NULL,NULL,'2025-03-29 15:36:42',NULL,'Problem configuration error: No valid test cases found.',NULL,0,'2025-03-29 15:36:42','2025-03-29 15:36:42'),(58,1,1,NULL,'// Write your code here\n\nfunction solve() {\n  // Your solution\n  \n}\n','63','pending',NULL,NULL,NULL,NULL,'2025-03-29 15:37:07',NULL,NULL,NULL,0,'2025-03-29 15:37:07','2025-03-29 15:37:07');
/*!40000 ALTER TABLE `submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `role` enum('competitor','admin','judge') DEFAULT 'competitor',
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `users_chk_1` CHECK ((`role` in (_utf8mb4'competitor',_utf8mb4'admin',_utf8mb4'judge')))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'xaverius.fransiscus078@gmail.com','admin','fxaveriu','$2b$10$dvEXizgYPoesynF.nkUMU.tNIaV2hrFEsFVDL9y1jFyJWBpDVf8z.','Fransiscus','Xaverius','2025-03-09 17:35:20','2025-03-09 17:35:20'),(2,'test@gamail.com','admin','test','$2b$10$B2gOyo7p935sinSWZSNqaumu.MBrRI0phePu5n8ArcI0ZjSOa9pte','test1','test1','2025-03-10 05:03:28','2025-03-10 05:03:28');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-05  8:30:12
