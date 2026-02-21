import { CreateBookingDTO } from "../dtos/booking.dto";
import { cancellBooking, confirmBooking, createBookingRepository, createIdempotencyKeyRepo, finalizeIdempotencyKey, getBookingById, getIdempotencyKeyWithLock } from "../repositories/booking.repository";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import generateIdemKey from "../utils/generateIdempotentKey";
import { PrismaClient, Prisma } from "../generated/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { validate as validateIdempotencyKeyFormat } from "uuid";
import { serverConfig } from "../config";
import { redLock } from "../config/redisConfig";
import { ResourceLockedError } from "../utils/errors/app.error";
import { getAvailableRooms, updateBookingIdToRooms } from "../api/hotel.api";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to initialize Prisma client");
}

const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

type AvailableRoom = {
    id: number;
    roomCategoryId: number;
    dateOfAvailability: Date;
}

export async function createBookingService(createBookingData : CreateBookingDTO) {

    const ttl = serverConfig.REDIS_TTL;
    const bookingResource = `lock:hoteId-${createBookingData.hotelId}`;

    const availableRooms = await getAvailableRooms(
        createBookingData.roomCategoryId,
        createBookingData.checkInDate,
        createBookingData.checkOutDate
    );

    const checkOutDate = new Date(createBookingData.checkOutDate);
    const checkInDate = new Date(createBookingData.checkInDate);

    const totalNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));

    if(availableRooms.length === 0 || availableRooms.length < totalNights) {
        throw new BadRequestError("No rooms available for the selected category and dates");
    }

    let lock;

    try {
        lock = await redLock.acquire([bookingResource], ttl);

        console.log("aquiring lock on:", bookingResource, lock);

        const booking = await createBookingRepository({
            userId : createBookingData.userId,
            hotelId: createBookingData.hotelId,
            bookingAmt: createBookingData.bookingAmt,
            totalGuest: createBookingData.totalGuest,
            checkInDate: new Date(createBookingData.checkInDate).toISOString(),
            checkOutDate: new Date(createBookingData.checkOutDate).toISOString(),
            roomCategoryId: createBookingData.roomCategoryId
        });

        const idemKey = generateIdemKey();

        await createIdempotencyKeyRepo(idemKey, booking.id);

        await updateBookingIdToRooms(booking.id, availableRooms.data.map((room : AvailableRoom) => room.id));

        return {
            bookingId: booking.id,
            idempotencyKey: idemKey
        }

    } catch (error) {
        throw new ResourceLockedError("The resource/hotel is under a lock");
    }
}

// potential issue in the confirmBookingService

export async function confirmBookingService(idempotencyKey: string) {

    return await prisma.$transaction(async (tx : Prisma.TransactionClient) => {

        if(!validateIdempotencyKeyFormat(idempotencyKey)) {
            throw new BadRequestError("Invalid idempotency key format")
        }

        const idempotencyKeyData = await getIdempotencyKeyWithLock(idempotencyKey, tx);

        if(!idempotencyKeyData || !idempotencyKeyData.bookingId) {
            throw new NotFoundError("Idempotency key not found");
        }

        if(idempotencyKeyData.finalized) {
            throw new BadRequestError("Idempotency key already finalized");
        }

        const booking = await confirmBooking(idempotencyKeyData.bookingId, tx);
        await finalizeIdempotencyKey(idempotencyKey, tx);
        
        return booking;
    })

    
}

export async function getBookingByIdService(bookingId: number) {
    const booking = await getBookingById(bookingId);

    if (!booking) {
        throw new NotFoundError("Booking not found");
    }

    return booking;
}

export async function cancelBookingService(bookingId: number) {
    const booking = await getBookingById(bookingId);

    if (!booking) {
        throw new NotFoundError("Booking not found");
    }

    if (booking.status === "CANCELLED") {
        throw new BadRequestError("Booking is already cancelled");
    }

    return await cancellBooking(bookingId);
}
