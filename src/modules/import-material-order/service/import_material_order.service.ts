import {
    Inject,
    Injectable,
    InternalServerErrorException,
    Optional,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ImportMaterialOrder } from '../entity/import_material_order.entity';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    DEFAULT_ORDER_BY,
    ORDER_DIRECTION,
} from 'src/common/constants';
import { Brackets, EntityManager, getConnection, Like } from 'typeorm';
import {
    CreateImportMaterialOrderDto,
    ImportMaterialOrderDetailResponseDto,
    ImportMaterialOrderQueryStringDto,
    UpdateImportMaterialOrderDto,
} from '../dto/import_material_order.dto';

const ImportMaterialOrderAttribute: (keyof ImportMaterialOrder)[] = [
    'id',
    'materialId',
    'pricePerUnit',
    'quantity',
    'note',
    'importMaterialId',
    'status',
    'createdAt',
    'updatedAt',
];
@Injectable()
export class ImportMaterialOrderService {
    constructor(
        @Optional() @Inject(REQUEST) private readonly request: Request,
        @InjectEntityManager()
        private readonly dbManager: EntityManager,
    ) {}

    generateQueryBuilder(queryBuilder, { keyword, importMaterialId }) {
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
        if (importMaterialId) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where([
                        {
                            importMaterialId,
                        },
                    ]);
                }),
            );
        }
    }

    async getImportMaterialOrderList(query: ImportMaterialOrderQueryStringDto) {
        try {
            console.log('query', query);

            const {
                keyword = '',
                page = DEFAULT_FIRST_PAGE,
                limit = DEFAULT_LIMIT_FOR_PAGINATION,
                orderBy = DEFAULT_ORDER_BY,
                orderDirection = ORDER_DIRECTION.ASC,
                importMaterialId = undefined,
            } = query;
            const take = +limit || DEFAULT_LIMIT_FOR_PAGINATION;
            const skip = (+page - 1) * take || 0;

            const [items, totalItems] = await this.dbManager.findAndCount(
                ImportMaterialOrder,
                {
                    select: ImportMaterialOrderAttribute,
                    where: (queryBuilder) =>
                        this.generateQueryBuilder(queryBuilder, {
                            keyword,
                            importMaterialId,
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

    async getImportMaterialOrderDetail(
        id: number,
    ): Promise<ImportMaterialOrderDetailResponseDto> {
        try {
            const importMaterialOrder = await this.dbManager.findOne(
                ImportMaterialOrder,
                {
                    select: ImportMaterialOrderAttribute,
                    where: { id },
                },
            );
            return importMaterialOrder;
        } catch (error) {
            throw error;
        }
    }

    async createImportMaterialOrder(
        importMaterialOrder: CreateImportMaterialOrderDto,
    ): Promise<ImportMaterialOrderDetailResponseDto> {
        try {
            const insertedMaterial = await this.dbManager
                .getRepository(ImportMaterialOrder)
                .insert(importMaterialOrder);
            const importMaterialOrderId = insertedMaterial?.identifiers[0]?.id;
            if (importMaterialOrderId) {
                const importMaterialOrderDetail =
                    await this.getImportMaterialOrderDetail(
                        importMaterialOrderId,
                    );
                return importMaterialOrderDetail;
            }
            throw new InternalServerErrorException();
        } catch (error) {
            throw error;
        }
    }

    async updateImportMaterialOrderStatus(
        id: number,
        updateImportMaterialOrder: UpdateImportMaterialOrderDto,
    ) {
        try {
            await this.dbManager.update(
                ImportMaterialOrder,
                id,
                updateImportMaterialOrder,
            );
            const savedMaterial = await this.getImportMaterialOrderDetail(id);
            return savedMaterial;
        } catch (error) {
            throw error;
        }
    }

    async bulkCreateImportMaterialOrders(
        importMaterialOrders: CreateImportMaterialOrderDto[],
    ) {
        try {
            await getConnection()
                .createQueryBuilder()
                .insert()
                .into(ImportMaterialOrder)
                .values(importMaterialOrders)
                .execute();
        } catch (err) {
            throw err;
        }
    }
}
