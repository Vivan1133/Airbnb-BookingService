import { Prisma, PrismaClient } from "@prisma/client";
import { NotFoundError } from "../utils/errors/app.error";
import { IdempotencyKey } from "../generated/browser";

const prisma = new PrismaClient();

export async function createBookingRepository(bookingData: {
    userId: number;
    hotelId: number;
    checkInDate: string;
    checkOutDate: string;
    roomCategoryId: number;
    bookingAmt: number;
    totalGuest: number;
}) {
    const booking = await prisma.booking.create({
        data: bookingData
    })

    return booking;
}

export async function createIdempotencyKeyRepo(key: string, bookingId: number) {
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

export async function getIdempotencyKeyWithLock(key: string, tx: Prisma.TransactionClient) {
    // const idempotencyKey = await prisma.idempotencyKey.findUnique({
    //     where: {
    //         idemKey: key
    //     }
    // })
    // return idempotencyKey;



    const idempotencyKey: Array<IdempotencyKey> = await tx.$queryRaw`
        SELECT * FROM idempotencyKey where idemKey=${key} FOR UPDATE
    `

    if(!idempotencyKey || idempotencyKey.length === 0) {
        throw new NotFoundError("IdempotencyKey not found")
    }

    return idempotencyKey[0];
}


export async function getBookingById(bookingId: number) {
    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId
        }
    })

    return booking;
}

export async function confirmBooking(bookingId: number, tx: Prisma.TransactionClient) {
    const booking = await tx.booking.update({
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


export async function finalizeIdempotencyKey(key: string, tx: Prisma.TransactionClient) {
    const idemKey = await tx.idempotencyKey.update({
        where: {
            idemKey: key
        },
        data: {
            finalized: true
        }
    })

    return idemKey;
}