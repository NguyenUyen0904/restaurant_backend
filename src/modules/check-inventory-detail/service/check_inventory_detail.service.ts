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
import { Brackets, EntityManager, Like } from 'typeorm';
import { CheckInventoryDetail } from '../entity/check_inventory_detail.entity';
import {
    CheckInventoryDetailQueryStringDto,
    CheckInventoryDetailDetailResponseDto,
    CreateCheckInventoryDetailDto,
    UpdateCheckInventoryDetailDto,
} from '../dto/check_inventory_detail.dto';
import { OrderBy } from '../check_inventory_detail.constant';

const CheckInventoryDetailAttribute: (keyof CheckInventoryDetail)[] = [
    'id',
    'materialId',
    'inventoryQuantity',
    'damagedQuantity',
    'note',
    'checkInventoryId',
    'status',
    'createdAt',
    'updatedAt',
];
@Injectable()
export class CheckInventoryDetailService {
    constructor(
        @Optional() @Inject(REQUEST) private readonly request: Request,
        @InjectEntityManager()
        private readonly dbManager: EntityManager,
    ) {}

    generateQueryBuilder(queryBuilder, { keyword, checkInventoryId }) {
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

        if (checkInventoryId) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where([
                        {
                            checkInventoryId,
                        },
                    ]);
                }),
            );
        }
    }

    async getCheckInventoryDetailList(
        query: CheckInventoryDetailQueryStringDto,
    ) {
        try {
            const {
                keyword = '',
                page = DEFAULT_FIRST_PAGE,
                limit = DEFAULT_LIMIT_FOR_PAGINATION,
                orderBy = DEFAULT_ORDER_BY,
                orderDirection = ORDER_DIRECTION.ASC,
                checkInventoryId = undefined,
            } = query;
            const take = +limit || DEFAULT_LIMIT_FOR_PAGINATION;
            const skip = (+page - 1) * take || 0;
            const [items, totalItems] = await this.dbManager.findAndCount(
                CheckInventoryDetail,
                {
                    select: CheckInventoryDetailAttribute,
                    where: (queryBuilder) =>
                        this.generateQueryBuilder(queryBuilder, {
                            keyword,
                            checkInventoryId,
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

    async getCheckInventoryDetailDetail(
        id: number,
    ): Promise<CheckInventoryDetailDetailResponseDto> {
        try {
            const exportMaterialOrder = await this.dbManager.findOne(
                CheckInventoryDetail,
                {
                    select: CheckInventoryDetailAttribute,
                    where: { id },
                },
            );
            return exportMaterialOrder;
        } catch (error) {
            throw error;
        }
    }

    async createCheckInventoryDetail(
        exportMaterialOrder: CreateCheckInventoryDetailDto,
    ): Promise<CheckInventoryDetailDetailResponseDto> {
        try {
            const insertedMaterial = await this.dbManager
                .getRepository(CheckInventoryDetail)
                .insert(exportMaterialOrder);
            const exportMaterialOrderId = insertedMaterial?.identifiers[0]?.id;
            if (exportMaterialOrderId) {
                const exportMaterialOrderDetail =
                    await this.getCheckInventoryDetailDetail(
                        exportMaterialOrderId,
                    );
                return exportMaterialOrderDetail;
            }
            throw new InternalServerErrorException();
        } catch (error) {
            throw error;
        }
    }

    async updateCheckInventoryDetailStatus(
        id: number,
        updateCheckInventoryDetail: UpdateCheckInventoryDetailDto,
    ) {
        try {
            await this.dbManager.update(
                CheckInventoryDetail,
                id,
                updateCheckInventoryDetail,
            );
            const savedMaterial = await this.getCheckInventoryDetailDetail(id);
            return savedMaterial;
        } catch (error) {
            throw error;
        }
    }
}
