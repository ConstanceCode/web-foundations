# SnapShare Scaling Plan

SnapShare is a photo-sharing app. Users upload photos and scroll a feed of photos from the people they follow. This document estimates how much traffic and storage the app needs to handle, and designs a system that can cope with it.

## 1. Assumptions

These are the starting facts, plus the extra numbers used in the calculations.

- **Registered users:** 10,000,000
- **Daily active users (DAU):** 10% of registered users are active each day
- **Uploads:** each active user uploads 1 photo per day
- **Feed views:** each active user views 50 feed pages per day
- **Photo size:** an average photo is 2 MB, and each photo also gets a 50 KB thumbnail
- **Seconds in a day:** 86,400
- **Peak traffic:** 5 times the average
- **Days in a year:** 365
- **Units:** decimal (1 TB = 1,000,000 MB)

Extra assumptions, used only for the bandwidth and database estimates:

- The feed shows thumbnails, about 10 per feed page.
- Each photo's database row (owner, caption, file paths, time) takes about 500 bytes.

**Daily active users:** 10,000,000 × 10% = **1,000,000 DAU**

## 2. Estimates

### Uploads per second

- Uploads per day: 1,000,000 users × 1 photo = 1,000,000 photos
- **Average:** 1,000,000 ÷ 86,400 ≈ **11.6 uploads per second**
- **Peak (5×):** ≈ **58 uploads per second**

### Feed views per second

- Feed views per day: 1,000,000 users × 50 = 50,000,000 views
- **Average:** 50,000,000 ÷ 86,400 ≈ **579 views per second**
- **Peak (5×):** ≈ **2,894 views per second**

### Photo storage per year

- Original photos per day: 1,000,000 × 2 MB = 2 TB
- Thumbnails per day: 1,000,000 × 50 KB = 50 GB
- Total per day: about 2.05 TB
- Originals per year: 2 TB × 365 = 730 TB
- Thumbnails per year: 50 GB × 365 = 18.25 TB
- **Total per year: about 748 TB (roughly 0.75 PB)**

### Bandwidth (extra)

- Peak upload traffic: 58 uploads per second × 2 MB ≈ 116 MB/s (about 0.9 Gbps)
- Peak feed traffic: 2,894 page views per second × 10 thumbnails × 50 KB ≈ 1.4 GB/s (about 11.6 Gbps)

### Database size (extra)

- Photo rows per year: 1,000,000 × 365 = 365 million
- At about 500 bytes each, that is roughly **180 GB per year** of data. This is tiny compared with the photo files.

## 3. Read-heavy or write-heavy?

SnapShare is **read-heavy**. There are 50,000,000 feed views for every 1,000,000 uploads, a ratio of about **50 reads to 1 write**.

What this means for the design:

- Optimise for reads first: serve photos from a **CDN**, keep popular data in a **cache**, and send feed queries to a **read replica** so the main database is not overloaded.
- Writes are rare, so they can take a slightly longer route. The upload path can hand slow work (making thumbnails) to a **queue and worker** so the user is not kept waiting.
- Reads can be scaled by adding more cache, replicas and app servers, which is cheaper than scaling writes.

## 4. Why photos do not go inside the database

- **Size:** photos add about 748 TB per year, while all the other data is only about 180 GB. Putting photos in the database would make it thousands of times larger.
- **Cost and speed:** database storage is expensive, and large files slow down queries, backups, restores and replication.
- **No CDN:** a CDN cannot serve images straight out of a database, but it can serve files from object storage.
- **Scaling:** a database is hard to scale for huge amounts of file data, while object storage is built for exactly that.

**Where they go instead:** the photo files (originals and thumbnails) go into **object storage** (for example Amazon S3). The database only stores the *path* to each file (for example `photos/2026/11/abc123.jpg`) along with the photo's details.

## 5. Architecture diagram

```text
   Users (mobile app / web browser)
      |                                |
      | view photos                    | API calls: upload, feed, follow
      v                                v
 +----------+                 +-----------------+
 |   CDN    |                 |  Load balancer  |
 +----+-----+                 +--------+--------+
      |                                |
      | (cache miss)           +-------+--------+
      |                        |       |        |
      |                  +-----v--+ +--v-----+ +-v------+
      |                  |  App   | |  App   | |  App   |
      |                  | server | | server | | server |
      |                  +----+---+ +----+---+ +---+----+
      |                       |          |         |
      |                       +----------+---------+
      |                                  |
      |          +-----------------+-----+-----------+
      |          |                 |                 |
      |          v                 v                 v
      |     +---------+     +------------+     +-----------+
      |     |  Cache  |     |  Database  |     |   Queue   |
      |     | (Redis) |     | (primary)  |     | (thumb-   |
      |     +---------+     +-----+------+     | nail jobs)|
      |                           |            +-----+-----+
      |                           | copies data      |
      |                           v                  v
      |                    +-------------+     +------------+
      |                    |    Read     |     |   Worker   |
      |                    |   replica   |     | (makes     |
      |                    +-------------+     | thumbnails)|
      |                                        +-----+------+
      |                                              |
      |    +-----------------------------------------+
      |    |  (app servers also save the original photo here)
      |    v
      |  +--------------------------------------+
      +->|  Object storage (photo files:        |
         |  originals + thumbnails)             |
         +--------------------------------------+
```

How the pieces connect:

- **Photo downloads:** users get photos and thumbnails from the CDN. On a cache miss, the CDN fetches the file from object storage.
- **Everything else:** API requests go through the load balancer to one of the app servers.
- **App servers:** they use the cache and the read replica for feed reads, the primary database for writes, object storage to save original photos, and the queue to request thumbnails.
- **Worker:** it takes jobs from the queue, reads the original photo from object storage, and saves the thumbnail back to it.

## 6. What each component does

- **CDN:** it keeps copies of photos and thumbnails in servers close to users, which solves slow image loading and takes most of the heavy download traffic off our own servers.
- **Load balancer:** it spreads incoming requests across many app servers, which solves the problem of one server being overloaded and lets us keep running if one server fails.
- **App servers:** they run the SnapShare logic (login, upload, feed), and because they hold no user data themselves we can add more of them as traffic grows.
- **Cache (Redis):** it keeps frequently requested data, such as ready-made feeds, in fast memory, which solves the problem of the database being hit by the same read over and over.
- **Database (primary):** it stores users, follows and photo details reliably, and it is the one place that accepts writes so the data stays consistent.
- **Read replica:** it is a live copy of the primary database that answers read queries, which solves the problem of 50 times more reads than writes overloading the primary.
- **Object storage:** it stores the photo files cheaply and almost without limit (hundreds of TB per year), which solves the problem of photos being too big for the database.
- **Queue:** it holds "make a thumbnail" jobs until a worker is free, which solves the problem of slow work making the user wait, and it protects us from upload spikes because jobs simply wait their turn.
- **Worker:** it takes jobs from the queue and creates the 50 KB thumbnails in the background, and we can run more workers when the queue gets long.

## 7. Upload flow, step by step

1. The user picks a photo in the app and taps Upload. The app sends it to the API.
2. The request reaches the **load balancer**, which passes it to one of the **app servers**.
3. The app server checks that the user is logged in and that the file is a valid image of an acceptable size.
4. The app server saves the original photo (about 2 MB) in **object storage**.
5. The app server writes a row in the **primary database** with the photo's details and its file path, marked as "thumbnail pending".
6. The app server puts a "create thumbnail for photo X" job on the **queue**.
7. The app server replies "upload successful" to the user straight away, without waiting for the thumbnail.
8. A **worker** picks up the job from the queue, reads the original from object storage, and creates the 50 KB thumbnail.
9. The worker saves the thumbnail in object storage and updates the database row to "ready" with the thumbnail's path.
10. The cache entries for the feeds of the poster's followers are cleared or updated, so the new photo appears.
11. Followers see the photo when they scroll their feed. The thumbnail is served through the **CDN**, and the feed details come from the **cache** or the **read replica**.

If a worker fails part-way, the job goes back on the queue and is tried again, so the thumbnail is still created.

## 8. Trade-offs

- **Speed vs fresh data (caching and read replicas):** caches and replicas make feeds fast, but they can show slightly old data. The replica copies data a moment after the primary, and a cached feed may not include a photo posted a second ago. We accept this, because a feed that is a few seconds behind is fine for a photo app, but it would not be acceptable for something like a bank balance. The cost is extra complexity in clearing the cache correctly.
- **Fast uploads vs instant thumbnails (queue):** replying before the thumbnail exists makes uploads feel fast and lets the system absorb spikes. The cost is a short delay before the thumbnail is ready, so the app needs to show a placeholder, and we need to monitor the queue and handle failed jobs.
- **Extra storage vs faster feeds (thumbnails):** storing a 50 KB thumbnail for every photo adds about 18 TB per year (roughly 2.5% more storage), but the feed loads 40 times less data per photo than the 2 MB original. We choose the extra storage because it greatly reduces bandwidth and loading time.
- **CDN cost vs speed:** a CDN costs money, but without it our servers would have to push about 11.6 Gbps of images at peak. We accept the cost because it makes images load faster for users and keeps the app servers free for real work.
