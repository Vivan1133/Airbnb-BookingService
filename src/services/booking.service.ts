import { CreateBookingDTO } from "../dtos/booking.dto";
import { confirmBooking, createBookingRepository, createIdempotencyKeyRepo, finalizeIdempotencyKey, getIdempotencyKeyWithLock } from "../repositories/booking.repository";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import generateIdemKey from "../utils/generateIdempotentKey";
import { PrismaClient } from "../../generated/prisma/client";
import { validate as validateIdempotencyKeyFormat } from "uuid";
import { serverConfig } from "../config";
import { redLock } from "../config/redisConfig";
import { ResourceLockedError } from "../utils/errors/app.error";

const prisma = new PrismaClient();

export async function createBookingService(createBookingData : CreateBookingDTO) {

    const ttl = serverConfig.REDIS_TTL;
    const bookingResource = `lock:hoteId-${createBookingData.hotelId}`;


    let lock;

    try {
        lock = await redLock.acquire([bookingResource], ttl);

        console.log("aquiring lock on:", bookingResource, lock);

        const booking = await createBookingRepository({
            userId : createBookingData.userId,
            hotelId: createBookingData.hotelId,
            bookingAmt: createBookingData.bookingAmt,
            totalGuest: createBookingData.totalGuest
        });

        const idemKey = generateIdemKey();

        await createIdempotencyKeyRepo(idemKey, booking.id);

        return {
            bookingId: booking.id,
            idempotencyKey: idemKey
        }

    } catch (error) {
        throw new ResourceLockedError("The resource/hotel is under a lock");
    }



    // return await redLock.using([bookingResource], ttl, async () => {
    //     const booking = await createBookingRepository({
    //         userId : createBookingData.userId,
    //         hotelId: createBookingData.hotelId,
    //         bookingAmt: createBookingData.bookingAmt,
    //         totalGuest: createBookingData.totalGuest
    //     });

    //     const idemKey = generateIdemKey();

    //     await createIdempotencyKeyRepo(idemKey, booking.id);

    //     return {
    //         bookingId: booking.id,
    //         idempotencyKey: idemKey
    //     }
    // });

}

// potential issue in the confirmBookingService

export async function confirmBookingService(idempotencyKey: string) {

    return await prisma.$transaction(async (tx) => {

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