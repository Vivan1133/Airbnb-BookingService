-- CreateTable
CREATE TABLE `IdempotencyKey` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idemKey` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `finalized` BOOLEAN NOT NULL DEFAULT false,
    `bookingId` INTEGER NOT NULL,

    UNIQUE INDEX `IdempotencyKey_idemKey_key`(`idemKey`),
    UNIQUE INDEX `IdempotencyKey_bookingId_key`(`bookingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `IdempotencyKey` ADD CONSTRAINT `IdempotencyKey_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
