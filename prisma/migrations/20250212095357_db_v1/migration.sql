/*
  Warnings:

  - A unique constraint covering the columns `[teacherId,studentId]` on the table `TeacherStudents` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Student` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Teacher` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `TeacherStudents` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX `TeacherStudents_teacherId_studentId_key` ON `TeacherStudents`(`teacherId`, `studentId`);
