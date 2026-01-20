# 📅 Booking Service

Booking Service is responsible for handling room bookings, ensuring consistency, idempotency, and concurrency safety.
It prevents double bookings using idempotency keys and Redis Redlock, and communicates asynchronously with the Hotel Service.

## 🚀 Features

🧾 Create & confirm bookings

🔁 Idempotent booking requests

🔒 Distributed locking using Redis Redlock

⚡ Prevents double bookings under high concurrency

📬 Async messaging to Hotel Service

📊 Booking lifecycle management

## 📘 Bookings Table

| Field            | Type      | Description                         |
| ---------------- | --------- | ----------------------------------- |
| `id`             | number    | Primary key                         |
| `hotelId`        | number    | Associated hotel                    |
| `userId`         | number    | User who made the booking           |
| `bookingAmt`     | number    | Total booking amount                |
| `status`         | enum      | `pending`, `confirmed`, `cancelled` |
| `totalGuest`     | number    | Number of guests                    |
| `checkinDate`    | date      | Check-in date                       |
| `checkoutDate`   | date      | Check-out date                      |
| `roomCategoryId` | number    | Room category booked                |
| `createdAt`      | timestamp | Booking creation time               |
| `updatedAt`      | timestamp | Booking last update time            |

## 🔁 Idempotency Keys Table

| Field       | Type      | Description                       |
| ----------- | --------- | --------------------------------- |
| `id`        | number    | Primary key                       |
| `idemKey`   | string    | Unique idempotency key            |
| `finalized` | boolean   | Indicates if booking is finalized |
| `bookingId` | number    | Linked booking ID                 |
| `createdAt` | timestamp | Record creation time              |
| `updatedAt` | timestamp | Record update time                |

## 📖 Booking Routes

Base Path: ```/booking```

| Method | Endpoint                            | Description                 |
| ------ | ----------------------------------- | --------------------------- |
| `POST` | `/booking`                          | Create booking (idempotent) |
| `POST` | `/booking/confirm/{idempotencyKey}` | Confirm booking             |


### 🔐 Idempotency Handling

Every booking request must include an idempotency key

Prevents duplicate bookings caused by retries

Booking is finalized only once per key

### 🔒 Concurrency Control (Redis Redlock)

Uses Redis Redlock instead of DB-level locks

Prevents race conditions during booking

Improves scalability across instances

Suitable for distributed systems

### 📬 Async Communication

Booking confirmation sends a message to the Hotel Service

Updates booking_id in the rooms table asynchronously

Decouples Booking and Hotel services

-------------------------------------------------

## Steps to setup the starter template

1. Clone the project

```
git clone https://github.com/Vivan1133/Airbnb-BookingService.git <ProjectName>
```

2. Move in to the folder structure

```
cd <ProjectName>
```

3. Install npm dependencies && generate prisma files

```
npm i 
npx prisma generate
```

4. Create a new .env file in the root directory and add the `PORT` env variable

```
PORT=port-number
DATABASE_URL="mysql://root:adminadmin@localhost:3306/airbnb_booking_dev"
REDIS_SERVER_URL="redis://localhost:6379"
REDIS_TTL=60000
HOTEL_SERVICE_URL="http://localhost:3000/api/v1" 
```

5. Start the express server

```
npm run dev
```
