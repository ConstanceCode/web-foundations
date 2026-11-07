# School Database Design

This database stores the students at a school, the courses they can take, and which student is enrolled on which course (with the grade they earned). It uses three tables.

## Tables

### `students`
- One row per student.
- `student_id` is the primary key.
- `name` is required (`NOT NULL`).
- `email` is required and `UNIQUE`, so two students cannot share an email address.

### `courses`
- One row per course.
- `course_id` is the primary key.
- `title` is required.
- `credits` is required and must be greater than 0.

### `enrolments`
- One row for each time a student is enrolled on a course. This is the join table.
- `enrolment_id` is the primary key.
- `student_id` is a foreign key to `students`, and `course_id` is a foreign key to `courses`. Both are required.
- `grade` is a number from 0 to 100. It can be `NULL`, because a student has no grade until the work is marked.
- `UNIQUE (student_id, course_id)` stops the same student being enrolled on the same course twice.

## Relationships

- **One student to many enrolments (one-to-many):** a student can have many enrolments, but each enrolment belongs to exactly one student.
- **One course to many enrolments (one-to-many):** a course can have many enrolments, but each enrolment belongs to exactly one course.
- **Students to courses (many-to-many):** one student can take many courses, and one course can have many students. This relationship is made of the two one-to-many links above.

**Why a join table is needed:** a column can only hold one simple value. If `students` had a `course_id` column, each student could only be on one course. If we crammed several course ids into one cell (like `"1,2,3"`), we could not use foreign keys, joins or counts properly. A separate `enrolments` table solves this by storing one row per student-and-course pair. It is also the natural home for the `grade`, because a grade belongs to the pair (this student on this course), not to the student or the course alone.

## Index I would add

- `CREATE INDEX idx_enrolments_course_id ON enrolments (course_id);`
- **Reason:** the `UNIQUE (student_id, course_id)` rule already creates an index that makes searching by student fast. Searching by course (listing the students on a course, or counting students per course) has no index to help it, so the database would have to scan the whole `enrolments` table. An index on `course_id` makes those lookups fast, and it matters more as the table grows.

## SQL or NoSQL?

I would choose SQL for this system. The data is highly structured and full of relationships (students, courses and the enrolments between them), and the questions we want to ask need joins, such as "which courses is this student taking?" or "how many students are on each course?". A relational database handles those well. It also enforces the rules we care about directly in the database: unique emails, valid foreign keys, no duplicate enrolments and grades between 0 and 100, so bad data cannot get in. A NoSQL document database is better suited to data with a flexible shape or huge scale, such as social media posts or sensor logs, and here it would mean duplicating student and course details inside many documents and keeping them in sync by hand. A school's data is small, predictable and relational, so SQL is the better fit.
