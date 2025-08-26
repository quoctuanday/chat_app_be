-- AlterTable
ALTER TABLE `attachment` ADD COLUMN `thumbnail_url` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `conversation` ADD COLUMN `is_archived` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `conversationmember` ADD COLUMN `is_muted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `last_read_message_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `friendship` ADD COLUMN `blocked_by_user_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `message` ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `reactions` JSON NULL,
    ADD COLUMN `reply_to_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `last_active` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `TypingStatus` (
    `id` VARCHAR(191) NOT NULL,
    `conversation_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `is_typing` BOOLEAN NOT NULL DEFAULT false,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `notification_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`notification_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_reply_to_id_fkey` FOREIGN KEY (`reply_to_id`) REFERENCES `Message`(`message_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TypingStatus` ADD CONSTRAINT `TypingStatus_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `Conversation`(`conversation_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TypingStatus` ADD CONSTRAINT `TypingStatus_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
