-- CreateTable
CREATE TABLE `C2CPrice` (
    `id` VARCHAR(191) NOT NULL,
    `asset` VARCHAR(191) NOT NULL,
    `fiat` VARCHAR(191) NOT NULL,
    `tradeType` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `C2CPrice_asset_fiat_tradeType_createdAt_idx`(`asset`, `fiat`, `tradeType`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
