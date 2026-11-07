# Library API Design: Books Resource

A REST API for managing the books in a library. All requests and responses use JSON.

## Base URL

- `https://api.example-library.com/v1`

## The Book object

- `id` (number): unique identifier, set by the server
- `title` (string): the book's title
- `author` (string): the author's full name
- `isbn` (string): the book's ISBN
- `publishedYear` (number): the year of publication
- `available` (boolean): `true` if the book can be borrowed

Example:

```json
{
  "id": 12,
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "isbn": "978-1-23456-789-0",
  "publishedYear": 1958,
  "available": true
}
```

## Endpoints

### 1. List all books

- **Method:** `GET`
- **Path:** `/books`
- **Description:** Returns every book in the library.
- **Request body:** none
- **Success status:** `200 OK`

### 2. Get one book

- **Method:** `GET`
- **Path:** `/books/{id}`
- **Description:** Returns the single book with the given id.
- **Request body:** none
- **Success status:** `200 OK`

### 3. Create a book

- **Method:** `POST`
- **Path:** `/books`
- **Description:** Adds a new book; the server assigns the `id`.
- **Example request body:**

  ```json
  {
    "title": "Weep Not, Child",
    "author": "Ngugi wa Thiong'o",
    "isbn": "978-1-23456-790-6",
    "publishedYear": 1964,
    "available": true
  }
  ```

- **Success status:** `201 Created` (the response body is the new book, and a `Location: /books/{id}` header points to it)

### 4. Update a book (replace)

- **Method:** `PUT`
- **Path:** `/books/{id}`
- **Description:** Replaces all the details of an existing book.
- **Example request body:**

  ```json
  {
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "isbn": "978-1-23456-789-0",
    "publishedYear": 1958,
    "available": false
  }
  ```

- **Success status:** `200 OK`

### 5. Update part of a book

- **Method:** `PATCH`
- **Path:** `/books/{id}`
- **Description:** Changes only the fields you send, for example marking a book as borrowed.
- **Example request body:**

  ```json
  { "available": false }
  ```

- **Success status:** `200 OK`

### 6. Delete a book

- **Method:** `DELETE`
- **Path:** `/books/{id}`
- **Description:** Removes the book from the library.
- **Request body:** none
- **Success status:** `204 No Content`

### 7. List books by an author

- **Method:** `GET`
- **Path:** `/books?author={name}`
- **Description:** Returns only the books written by the given author, using a query parameter.
- **Example:** `GET /books?author=Chinua%20Achebe`
- **Request body:** none
- **Success status:** `200 OK` (an empty list `[]` if the author has no books)

## Error codes

### 400 Bad Request

- **Meaning:** The request is invalid, so the server cannot process it.
- **Example:** `POST /books` with the `title` missing, or with `publishedYear` sent as `"abc"` instead of a number.
- **Example response body:**

  ```json
  { "error": "Bad Request", "message": "The field 'title' is required." }
  ```

### 404 Not Found

- **Meaning:** The book that was asked for does not exist.
- **Example:** `GET /books/9999` when no book has the id 9999 (the same applies to `PUT`, `PATCH` and `DELETE` on a missing id).
- **Example response body:**

  ```json
  { "error": "Not Found", "message": "No book exists with id 9999." }
  ```
