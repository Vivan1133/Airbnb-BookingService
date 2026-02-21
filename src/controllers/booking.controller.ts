import { Request, Response } from "express";
import { cancelBookingService, confirmBookingService, createBookingService, getBookingByIdService } from "../services/booking.service"
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../utils/errors/app.error";


export const createBookingHandler = async (req: Request, res: Response) => {

    const booking = await createBookingService(req.body);

    res.status(StatusCodes.CREATED).json({
        bookingId: booking.bookingId,
        idempotencyKey: booking.idempotencyKey
    })
}

export const confirmBookingHandler = async (req: Request, res: Response) => {
    const booking = await confirmBookingService(req.params.idempotencyKey);

    res.status(StatusCodes.OK).json({
        bookingId: booking.id,
        status: booking.status
    })
}

function parseBookingId(bookingId: string): number {
    const parsedBookingId = Number(bookingId);

    if (!Number.isInteger(parsedBookingId) || parsedBookingId <= 0) {
        throw new BadRequestError("bookingId must be a positive integer");
    }

    return parsedBookingId;
}

export const getBookingByIdHandler = async (req: Request, res: Response) => {
    const bookingId = parseBookingId(req.params.bookingId);
    const booking = await getBookingByIdService(bookingId);

    res.status(StatusCodes.OK).json({
        booking
    });
}

export const cancelBookingHandler = async (req: Request, res: Response) => {
    const bookingId = parseBookingId(req.params.bookingId);
    const booking = await cancelBookingService(bookingId);

    res.status(StatusCodes.OK).json({
        bookingId: booking.id,
        status: booking.status
    });
}
