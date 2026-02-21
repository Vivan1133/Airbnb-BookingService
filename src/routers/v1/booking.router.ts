import express from 'express';
import {  validateRequestBody } from '../../validators';
import { createBookingSchema } from '../../validators/booking.validator';
import { cancelBookingHandler, confirmBookingHandler, createBookingHandler, getBookingByIdHandler } from '../../controllers/booking.controller';

const bookingRouter = express.Router();

bookingRouter.post("/", validateRequestBody(createBookingSchema), createBookingHandler);
bookingRouter.post("/confirm/:idempotencyKey", confirmBookingHandler);
bookingRouter.get("/:bookingId", getBookingByIdHandler);
bookingRouter.patch("/:bookingId/cancel", cancelBookingHandler);

export default bookingRouter;