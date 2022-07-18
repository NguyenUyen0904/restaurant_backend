import { Material } from './../../material/entity/material.entity';
import { HttpStatus } from '../../../common/constants';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Request } from 'express';
import { EntityManager, In } from 'typeorm';

import { getConnection } from 'typeorm';
import { I18nRequestScopeService } from 'nestjs-i18n';
import {
    CreateImportMaterialOrderDto,
    ImportMaterialDetailExcelDto,
} from '../dto/import_material_order.dto';
import { ImportMaterialOrder } from '../entity/import_material_order.entity';
import { AcceptStatus } from 'src/modules/common/common.constant';

@Injectable()
export class ImportMaterialDetailExcelService {
    constructor(
        @Optional() @Inject(REQUEST) private readonly request: Request,
        @InjectEntityManager()
        private readonly dbManager: EntityManager,
        private readonly i18n: I18nRequestScopeService,
    ) {}
    async getMaterials(materialNames: string[]): Promise<Material[]> {
        const materials = await this.dbManager.find(Material, {
            select: ['material', 'unit'],
            where: { material: In(materialNames) },
        });

        return materials;
    }

    async validateImportMaterialDetailExcel(
        importMaterialDetailExcelDto: ImportMaterialDetailExcelDto,
        materialList: Material[],
    ) {
        const validationResult = {
            isValid: true,
            errors: [],
        };

        const material = materialList.find(
            (material) =>
                material.material === importMaterialDetailExcelDto.material &&
                material.unit === importMaterialDetailExcelDto.unit,
        );

        if (material) {
            const errorMessage = await this.i18n.translate(
                'user.common.error.email.exist',
            );
            validationResult.errors.push({
                column: 'email',
                errorMessage,
                errorCode: HttpStatus.ITEM_ALREADY_EXIST,
            });
            validationResult.isValid = false;
        }

        return { validationResult, index: importMaterialDetailExcelDto.index };
    }

    mapImportMaterialDetailExcel(
        importMaterialDetailExcelDto: ImportMaterialDetailExcelDto,
        materialList: Material[],
        createdBy: number,
    ): CreateImportMaterialOrderDto {
        const material = materialList.find(
            (material) =>
                material.material === importMaterialDetailExcelDto.material &&
                material.unit === importMaterialDetailExcelDto.unit,
        );

        if (material) {
            importMaterialDetailExcelDto.materialId = material.id;
        }

        return {
            ...importMaterialDetailExcelDto,
            status: AcceptStatus.APPROVE,
            createdBy: createdBy,
        };
    }

    async bulkCreateImportMaterialOrders(
        importMaterialDetailExcels: CreateImportMaterialOrderDto[],
    ) {
        try {
            await getConnection()
                .createQueryBuilder()
                .insert()
                .into(ImportMaterialOrder)
                .values(importMaterialDetailExcels)
                .execute();
        } catch (err) {
            throw err;
        }
    }
}
