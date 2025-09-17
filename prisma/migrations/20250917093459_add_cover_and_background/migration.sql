-- AlterTable
ALTER TABLE `conversation` ADD COLUMN `background_url` TEXT NULL;

-- AlterTable
ALTER TABLE `messagestatus` MODIFY `status` ENUM('sent', 'delivered', 'unread', 'read') NOT NULL DEFAULT 'sent';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `cover_url` TEXT NULL;
