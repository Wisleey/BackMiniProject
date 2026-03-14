-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `login` VARCHAR(100) NOT NULL,
    `senhaHash` VARCHAR(255) NOT NULL,
    `role` ENUM('REGISTRO', 'AUTORIZACAO', 'ADMINISTRACAO') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_login_key`(`login`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cnpjFavorecido` VARCHAR(14) NOT NULL,
    `razaoSocial` VARCHAR(200) NOT NULL,
    `valor` DECIMAL(15, 2) NOT NULL,
    `descricaoServico` VARCHAR(500) NOT NULL,
    `dataRegistro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('PENDENTE', 'AUTORIZADO', 'REJEITADO') NOT NULL DEFAULT 'PENDENTE',
    `solicitanteId` INTEGER NOT NULL,
    `autorizadorId` INTEGER NULL,
    `dataDecisao` DATETIME(3) NULL,
    `motivoRejeicao` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `pagamentos_status_idx`(`status`),
    INDEX `pagamentos_solicitanteId_idx`(`solicitanteId`),
    INDEX `pagamentos_autorizadorId_idx`(`autorizadorId`),
    INDEX `pagamentos_dataRegistro_idx`(`dataRegistro`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_solicitanteId_fkey` FOREIGN KEY (`solicitanteId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_autorizadorId_fkey` FOREIGN KEY (`autorizadorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
