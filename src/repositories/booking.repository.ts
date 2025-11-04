import { Prisma } from "../generated/browser";
import { PrismaClient } from "../../generated/prisma/client";

const prisma = new PrismaClient();

export async function createBookingRepository(bookingData: Prisma.BookingCreateInput) {
    const booking = await prisma.booking.create({
        data: bookingData
    })

    return booking;
}

export async function createIdempotencyKey(key: string, bookingId: number) {
    const idempotentKey = await prisma.idempotencyKey.create({
        data: {
            idemKey: key,
            booking: {
                connect: {
                    id: bookingId
                }
            }
        }
    })

    return idempotentKey;
}

export async function getIdempotencyKey(key: string) {
    const idempotencyKey = await prisma.idempotencyKey.findUnique({
        where: {
            idemKey: key
        }
    })
    return idempotencyKey;
}


export async function getBookingById(bookingId: number) {
    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId
        }
    })

    return booking;
}

export async function confirmBooking(bookingId: number) {
    const booking = await prisma.booking.update({
        where: {
            id: bookingId
        },
        data: {
            status: "CONFIRMED"
        }
    })

    return booking;
}

export async function cancellBooking(bookingId: number) {
    const booking = await prisma.booking.update({
        where: {
            id: bookingId
        },
        data: {
            status: "CANCELLED"
        }
    })

    return booking;
}


export async function finalizeIdempotencyKey(key: string) {
    const idemKey = await prisma.idempotencyKey.update({
        where: {
            idemKey: key
        },
        data: {
            finalized: true
        }
    })

    return idemKey;
}