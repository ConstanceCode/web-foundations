-- ============================================================
-- school.sql : students, courses and enrolments (SQLite)
-- Paste into sqliteonline.com (choose SQLite) and click Run.
-- To see the result of one query, highlight it and click Run.
-- ============================================================

PRAGMA foreign_keys = ON;

-- Start clean so the file can be run again and again
DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

-- ------------------------------------------------------------
-- 1. Tables
-- ------------------------------------------------------------

CREATE TABLE students (
  student_id INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
  course_id INTEGER PRIMARY KEY,
  title     TEXT    NOT NULL,
  credits   INTEGER NOT NULL CHECK (credits > 0)
);

-- Join table: one row = one student enrolled on one course
CREATE TABLE enrolments (
  enrolment_id INTEGER PRIMARY KEY,
  student_id   INTEGER NOT NULL,
  course_id    INTEGER NOT NULL,
  grade        INTEGER CHECK (grade BETWEEN 0 AND 100), -- NULL = not graded yet
  FOREIGN KEY (student_id) REFERENCES students (student_id),
  FOREIGN KEY (course_id)  REFERENCES courses (course_id),
  UNIQUE (student_id, course_id) -- the same student cannot join the same course twice
);

-- Speeds up "who is on this course?" and "how many students per course?"
CREATE INDEX idx_enrolments_course_id ON enrolments (course_id);

-- ------------------------------------------------------------
-- 2. Sample data
-- ------------------------------------------------------------

INSERT INTO students (student_id, name, email) VALUES
  (1, 'Amina Hassan',     'amina.hassan@example.com'),
  (2, 'Brian Otieno',     'brian.otieno@example.com'),
  (3, 'Cynthia Wanjiru',  'cynthia.wanjiru@example.com'),
  (4, 'David Kimani',     'david.kimani@example.com'),
  (5, 'Esther Njeri',     'esther.njeri@example.com');

INSERT INTO courses (course_id, title, credits) VALUES
  (1, 'Web Foundations', 3),
  (2, 'Databases',       4),
  (3, 'Python Basics',   3),
  (4, 'Data Ethics',     2);

INSERT INTO enrolments (enrolment_id, student_id, course_id, grade) VALUES
  (1, 1, 1, 85),
  (2, 1, 2, 78),
  (3, 2, 1, 70),
  (4, 3, 2, 92),
  (5, 3, 3, NULL),
  (6, 4, 1, 64),
  (7, 4, 3, 88);

-- These would FAIL (uncomment one to see the rule working):
-- INSERT INTO enrolments (student_id, course_id, grade) VALUES (1, 1, 50);        -- duplicate enrolment
-- INSERT INTO students (name, email) VALUES ('Copy', 'amina.hassan@example.com'); -- duplicate email
-- INSERT INTO enrolments (student_id, course_id) VALUES (99, 1);                  -- student 99 does not exist

-- ------------------------------------------------------------
-- 3. Queries
-- ------------------------------------------------------------

-- Query 1: all courses for one student (by name)
SELECT c.title, c.credits, e.grade
FROM students AS s
JOIN enrolments AS e ON e.student_id = s.student_id
JOIN courses    AS c ON c.course_id  = e.course_id
WHERE s.name = 'Amina Hassan';

-- Query 2: all students on one course
SELECT s.name, s.email, e.grade
FROM courses AS c
JOIN enrolments AS e ON e.course_id  = c.course_id
JOIN students   AS s ON s.student_id = e.student_id
WHERE c.title = 'Web Foundations';

-- Query 3: the number of students per course (LEFT JOIN keeps courses with 0 students)
SELECT c.title, COUNT(e.enrolment_id) AS student_count
FROM courses AS c
LEFT JOIN enrolments AS e ON e.course_id = c.course_id
GROUP BY c.course_id, c.title
ORDER BY student_count DESC, c.title;

-- Query 4: students who have no enrolments
SELECT s.student_id, s.name, s.email
FROM students AS s
LEFT JOIN enrolments AS e ON e.student_id = s.student_id
WHERE e.enrolment_id IS NULL;

-- Query 5: update one enrolment's grade (Cynthia's grade for Python Basics)
UPDATE enrolments
SET grade = 90
WHERE student_id = (SELECT student_id FROM students WHERE name = 'Cynthia Wanjiru')
  AND course_id  = (SELECT course_id  FROM courses  WHERE title = 'Python Basics');

-- Check the update worked
SELECT s.name, c.title, e.grade
FROM enrolments AS e
JOIN students AS s ON s.student_id = e.student_id
JOIN courses  AS c ON c.course_id  = e.course_id
WHERE s.name = 'Cynthia Wanjiru';
