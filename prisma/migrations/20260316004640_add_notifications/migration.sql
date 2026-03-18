-- CreateTable
CREATE TABLE `notificacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `tipo` ENUM('PAGAMENTO_REJEITADO') NOT NULL,
    `titulo` VARCHAR(150) NOT NULL,
    `mensagem` VARCHAR(500) NOT NULL,
    `payload` JSON NULL,
    `lidaEm` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notificacoes_usuarioId_idx`(`usuarioId`),
    INDEX `notificacoes_usuarioId_lidaEm_idx`(`usuarioId`, `lidaEm`),
    INDEX `notificacoes_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
