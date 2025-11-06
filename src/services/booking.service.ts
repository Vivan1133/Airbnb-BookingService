import { CreateBookingDTO } from "../dtos/booking.dto";
import { confirmBooking, createBookingRepository, createIdempotencyKeyRepo, finalizeIdempotencyKey, getIdempotencyKeyWithLock } from "../repositories/booking.repository";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import generateIdemKey from "../utils/generateIdempotentKey";
import { PrismaClient } from "../../generated/prisma/client";

const prisma = new PrismaClient();

export async function createBookingService(createBookingData : CreateBookingDTO) {
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
}

// potential issue in the confirmBookingService

export async function confirmBookingService(idempotencyKey: string) {

    return await prisma.$transaction(async (tx) => {
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