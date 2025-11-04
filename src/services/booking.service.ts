import { CreateBookingDTO } from "../dtos/booking.dto";
import { confirmBooking, createBookingRepository, createIdempotencyKey, finalizeIdempotencyKey, getIdempotencyKey } from "../repositories/booking.repository";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import generateIdemKey from "../utils/generateIdempotentKey";

export async function createBookingService(createBookingData : CreateBookingDTO) {
    const booking = await createBookingRepository({
        userId : createBookingData.userId,
        hotelId: createBookingData.hotelId,
        bookingAmt: createBookingData.bookingAmt,
        totalGuest: createBookingData.totalGuest
    });

    const idemKey = generateIdemKey();

    await createIdempotencyKey(idemKey, booking.id);

    return {
        bookingId: booking.id,
        idempotencyKey: idemKey
    }
}

export async function confirmBookingService(idempotencyKey: string) {
    const idempotencyKeyData = await getIdempotencyKey(idempotencyKey);

    if(!idempotencyKeyData) {
        throw new NotFoundError("Idempotency key not found");
    }

    if(idempotencyKeyData.finalized) {
        throw new BadRequestError("Idempotency key already finalized");
    }

    const booking = await confirmBooking(idempotencyKeyData.bookingId);
    await finalizeIdempotencyKey(idempotencyKey);
    
    return booking;
}