import { z } from "zod";

export const createBookingSchema = z.object({
    userId: z.number({message: "userId must be present"}),
    hotelId: z.number({message: "hotelId must be present"}),
    bookingAmt: z.number({message: "bookingAmt must be present"}).min(1, "booking amout must be greater than 1"),
    totalGuest: z.number({message: "total guests must be present"}).min(1, "total guest must be greater than or equal to 1"),
    checkInDate: z.string({ message: "check in date must be present"}),
    checkOutDate: z.string({ message: "check out date must be present"}),
    roomCategoryId: z.number({ message: "room category id must be present"})
})