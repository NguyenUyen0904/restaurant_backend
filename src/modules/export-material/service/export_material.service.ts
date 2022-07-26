import {
    Injectable,
    Optional,
    Inject,
    InternalServerErrorException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    DEFAULT_ORDER_BY,
    ORDER_DIRECTION,
} from 'src/common/constants';
import { EntityManager, Brackets, Like } from 'typeorm';
import {
    ExportMaterialQueryStringDto,
    ExportMaterialDetailResponseDto,
    CreateExportMaterialDto,
    UpdateExportMaterialDto,
} from '../dto/export_material.dto';
import { ExportMaterial } from '../entity/export_material.entity';
import { AcceptStatus } from 'src/modules/common/common.constant';
import { ExportMaterialOrder } from 'src/modules/export-material-order/entity/export_material_order.entity';
import { ImportMaterialOrder } from 'src/modules/import-material-order/entity/import_material_order.entity';
import { ImportMaterial } from 'src/modules/import-material/entity/import_material.entity';
import { Material } from 'src/modules/material/entity/material.entity';

const ExportMaterialAttribute: (keyof ExportMaterial)[] = [
    'id',
    'transporters',
    'warehouseStaffId',
    'totalPaymentExport',
    'status',
    'note',
    'createdAt',
    'updatedAt',
];

@Injectable()
export class ExportMaterialService {
    constructor(
        @Optional() @Inject(REQUEST) private readonly request: Request,
        @InjectEntityManager()
        private readonly dbManager: EntityManager,
    ) {}

    generateQueryBuilder(queryBuilder, { keyword }) {
        if (keyword) {
            const likeKeyword = `%${keyword}%`;
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where([
                        {
                            material: Like(likeKeyword),
                        },
                    ]);
                }),
            );
        }
    }

    async getExportMaterialList(query: ExportMaterialQueryStringDto) {
        try {
            const {
                keyword = '',
                page = DEFAULT_FIRST_PAGE,
                limit = DEFAULT_LIMIT_FOR_PAGINATION,
                orderBy = DEFAULT_ORDER_BY,
                orderDirection = ORDER_DIRECTION.ASC,
            } = query;
            const take = +limit || DEFAULT_LIMIT_FOR_PAGINATION;
            const skip = (+page - 1) * take || 0;
            const [items, totalItems] = await this.dbManager.findAndCount(
                ExportMaterial,
                {
                    select: ExportMaterialAttribute,
                    where: (queryBuilder) =>
                        this.generateQueryBuilder(queryBuilder, {
                            keyword,
                        }),
                    order: {
                        [orderBy]: orderDirection.toUpperCase(),
                    },
                    relations: ['warehouseStaff'],
                    take,
                    skip,
                },
            );
            return {
                items,
                totalItems,
            };
        } catch (error) {
            throw error;
        }
    }

    async getExportMaterialDetail(
        id: number,
    ): Promise<ExportMaterialDetailResponseDto> {
        try {
            const exportMaterial = await this.dbManager.findOne(
                ExportMaterial,
                {
                    select: ExportMaterialAttribute,
                    where: { id },
                },
            );
            return exportMaterial;
        } catch (error) {
            throw error;
        }
    }

    async createExportMaterial(
        exportMaterial: CreateExportMaterialDto,
    ): Promise<ExportMaterialDetailResponseDto> {
        try {
            const insertedMaterial = await this.dbManager
                .getRepository(ExportMaterial)
                .insert(exportMaterial);
            const exportMaterialId = insertedMaterial?.identifiers[0]?.id;
            if (exportMaterialId) {
                const exportMaterialDetail = await this.getExportMaterialDetail(
                    exportMaterialId,
                );
                return exportMaterialDetail;
            }
            throw new InternalServerErrorException();
        } catch (error) {
            throw error;
        }
    }

    async updateExportMaterialStatus(
        id: number,
        updateExportMaterial: UpdateExportMaterialDto,
    ) {
        try {
            await this.dbManager.update(
                ExportMaterial,
                id,
                updateExportMaterial,
            );
            const savedMaterial = await this.getExportMaterialDetail(id);
            return savedMaterial;
        } catch (error) {
            throw error;
        }
    }

    async updateQuantityMaterialInWareHouse(exportMaterialId: number) {
        try {
            const materials = await this.dbManager.find(ExportMaterialOrder, {
                where: { exportMaterialId, status: AcceptStatus.APPROVE },
            });
            materials.forEach(async (element) => {
                const material = await this.dbManager.findOne(Material, {
                    where: {
                        id: element.materialId,
                    },
                });

                await this.dbManager.update(
                    Material,
                    {
                        id: element.materialId,
                    },
                    {
                        quantity: material.quantity - element.quantity,
                    },
                );
            });
        } catch (error) {
            throw error;
        }
    }

    async updateTotalPayment(exportMaterialId: number) {
        try {
            const materials = await this.dbManager.find(ExportMaterialOrder, {
                where: { exportMaterialId, status: AcceptStatus.APPROVE },
            });
            let newTotalPayment = 0;
            materials.forEach((element) => {
                newTotalPayment += element.pricePerUnit * element.quantity;
            });
            await this.dbManager.update(
                ExportMaterial,
                {
                    id: exportMaterialId,
                },
                {
                    totalPaymentExport: newTotalPayment,
                },
            );
        } catch (error) {
            throw error;
        }
    }
}
