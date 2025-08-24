/*
  Warnings:

  - The primary key for the `attachment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `conversation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `conversationmember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `friendship` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `messagestatus` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `attachment` DROP FOREIGN KEY `Attachment_message_id_fkey`;

-- DropForeignKey
ALTER TABLE `conversation` DROP FOREIGN KEY `Conversation_created_by_id_fkey`;

-- DropForeignKey
ALTER TABLE `conversationmember` DROP FOREIGN KEY `ConversationMember_conversation_id_fkey`;

-- DropForeignKey
ALTER TABLE `conversationmember` DROP FOREIGN KEY `ConversationMember_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `friendship` DROP FOREIGN KEY `Friendship_friend_id_fkey`;

-- DropForeignKey
ALTER TABLE `friendship` DROP FOREIGN KEY `Friendship_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_conversation_id_fkey`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_sender_id_fkey`;

-- DropForeignKey
ALTER TABLE `messagestatus` DROP FOREIGN KEY `MessageStatus_message_id_fkey`;

-- DropForeignKey
ALTER TABLE `messagestatus` DROP FOREIGN KEY `MessageStatus_user_id_fkey`;

-- DropIndex
DROP INDEX `Attachment_message_id_fkey` ON `attachment`;

-- DropIndex
DROP INDEX `Conversation_created_by_id_fkey` ON `conversation`;

-- DropIndex
DROP INDEX `ConversationMember_user_id_fkey` ON `conversationmember`;

-- DropIndex
DROP INDEX `Friendship_friend_id_fkey` ON `friendship`;

-- DropIndex
DROP INDEX `Message_conversation_id_fkey` ON `message`;

-- DropIndex
DROP INDEX `Message_sender_id_fkey` ON `message`;

-- DropIndex
DROP INDEX `MessageStatus_user_id_fkey` ON `messagestatus`;

-- AlterTable
ALTER TABLE `attachment` DROP PRIMARY KEY,
    MODIFY `attachment_id` VARCHAR(191) NOT NULL,
    MODIFY `message_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`attachment_id`);

-- AlterTable
ALTER TABLE `conversation` DROP PRIMARY KEY,
    MODIFY `conversation_id` VARCHAR(191) NOT NULL,
    MODIFY `created_by_id` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`conversation_id`);

-- AlterTable
ALTER TABLE `conversationmember` DROP PRIMARY KEY,
    MODIFY `conversation_id` VARCHAR(191) NOT NULL,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`conversation_id`, `user_id`);

-- AlterTable
ALTER TABLE `friendship` DROP PRIMARY KEY,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    MODIFY `friend_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`user_id`, `friend_id`);

-- AlterTable
ALTER TABLE `message` DROP PRIMARY KEY,
    MODIFY `message_id` VARCHAR(191) NOT NULL,
    MODIFY `conversation_id` VARCHAR(191) NOT NULL,
    MODIFY `sender_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`message_id`);

-- AlterTable
ALTER TABLE `messagestatus` DROP PRIMARY KEY,
    MODIFY `message_id` VARCHAR(191) NOT NULL,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`message_id`, `user_id`);

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`user_id`);

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `User`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversationMember` ADD CONSTRAINT `ConversationMember_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `Conversation`(`conversation_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversationMember` ADD CONSTRAINT `ConversationMember_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `Conversation`(`conversation_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageStatus` ADD CONSTRAINT `MessageStatus_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `Message`(`message_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageStatus` ADD CONSTRAINT `MessageStatus_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Friendship` ADD CONSTRAINT `Friendship_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Friendship` ADD CONSTRAINT `Friendship_friend_id_fkey` FOREIGN KEY (`friend_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attachment` ADD CONSTRAINT `Attachment_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `Message`(`message_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
