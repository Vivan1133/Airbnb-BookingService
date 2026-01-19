export type CreateBookingDTO = {
    userId: number,
    hotelId: number,
    bookingAmt: number,
    totalGuest: number,
    checkInDate: string,
    checkOutDate: string,
    roomCategoryId: number
}