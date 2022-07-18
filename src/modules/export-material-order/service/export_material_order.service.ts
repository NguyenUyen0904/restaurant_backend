import {
    Inject,
    Injectable,
    InternalServerErrorException,
    Optional,
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
import { Brackets, EntityManager, getConnection, Like } from 'typeorm';
import {
    CreateExportMaterialOrderDto,
    ExportMaterialOrderDetailResponseDto,
    ExportMaterialOrderQueryStringDto,
    UpdateExportMaterialOrderDto,
} from '../dto/export_material_order.dto';
import { ExportMaterialOrder } from '../entity/export_material_order.entity';

const ExportMaterialOrderAttribute: (keyof ExportMaterialOrder)[] = [
    'id',
    'materialId',
    'pricePerUnit',
    'quantity',
    'note',
    'exportMaterialId',
    'status',
    'createdAt',
    'updatedAt',
];
@Injectable()
export class ExportMaterialOrderService {
    constructor(
        @Optional() @Inject(REQUEST) private readonly request: Request,
        @InjectEntityManager()
        private readonly dbManager: EntityManager,
    ) {}

    generateQueryBuilder(queryBuilder, { keyword, exportMaterialId }) {
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

        if (exportMaterialId) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where([
                        {
                            exportMaterialId,
                        },
                    ]);
                }),
            );
        }
    }

    async getExportMaterialOrderList(query: ExportMaterialOrderQueryStringDto) {
        try {
            const {
                keyword = '',
                page = DEFAULT_FIRST_PAGE,
                limit = DEFAULT_LIMIT_FOR_PAGINATION,
                orderBy = DEFAULT_ORDER_BY,
                orderDirection = ORDER_DIRECTION.ASC,
                exportMaterialId = undefined,
            } = query;
            const take = +limit || DEFAULT_LIMIT_FOR_PAGINATION;
            const skip = (+page - 1) * take || 0;
            const [items, totalItems] = await this.dbManager.findAndCount(
                ExportMaterialOrder,
                {
                    select: ExportMaterialOrderAttribute,
                    where: (queryBuilder) =>
                        this.generateQueryBuilder(queryBuilder, {
                            keyword,
                            exportMaterialId,
                        }),
                    order: {
                        [orderBy]: orderDirection.toUpperCase(),
                    },
                    relations: ['material'],
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

    async getExportMaterialOrderDetail(
        id: number,
    ): Promise<ExportMaterialOrderDetailResponseDto> {
        try {
            const exportMaterialOrder = await this.dbManager.findOne(
                ExportMaterialOrder,
                {
                    select: ExportMaterialOrderAttribute,
                    where: { id },
                },
            );
            return exportMaterialOrder;
        } catch (error) {
            throw error;
        }
    }

    async createExportMaterialOrder(
        exportMaterialOrder: CreateExportMaterialOrderDto,
    ): Promise<ExportMaterialOrderDetailResponseDto> {
        try {
            const insertedMaterial = await this.dbManager
                .getRepository(ExportMaterialOrder)
                .insert(exportMaterialOrder);
            const exportMaterialOrderId = insertedMaterial?.identifiers[0]?.id;
            if (exportMaterialOrderId) {
                const exportMaterialOrderDetail =
                    await this.getExportMaterialOrderDetail(
                        exportMaterialOrderId,
                    );
                return exportMaterialOrderDetail;
            }
            throw new InternalServerErrorException();
        } catch (error) {
            throw error;
        }
    }

    async updateExportMaterialOrderStatus(
        id: number,
        updateExportMaterialOrder: UpdateExportMaterialOrderDto,
    ) {
        try {
            await this.dbManager.update(
                ExportMaterialOrder,
                id,
                updateExportMaterialOrder,
            );
            const savedMaterial = await this.getExportMaterialOrderDetail(id);
            return savedMaterial;
        } catch (error) {
            throw error;
        }
    }

    async bulkCreateImportMaterialOrders(
        exportMaterialOrders: CreateExportMaterialOrderDto[],
    ) {
        try {
            await getConnection()
                .createQueryBuilder()
                .insert()
                .into(ExportMaterialOrder)
                .values(exportMaterialOrders)
                .execute();
        } catch (err) {
            throw err;
        }
    }
}
