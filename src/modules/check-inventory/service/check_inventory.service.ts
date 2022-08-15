import { CheckInventoryDetail } from './../../check-inventory-detail/entity/check_inventory_detail.entity';
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
import { EntityManager, Brackets, Like, Not } from 'typeorm';
import {
    CheckInventoryQueryStringDto,
    CheckInventoryDetailResponseDto,
    CreateCheckInventoryDto,
    UpdateCheckInventoryDto,
} from '../dto/check_inventory.dto';
import { CheckInventory } from '../entity/check_inventory.entity';
import { AcceptStatus } from 'src/modules/common/common.constant';
import { Material } from 'src/modules/material/entity/material.entity';

const CheckInventoryAttribute: (keyof CheckInventory)[] = [
    'id',
    'warehouseStaffId',
    'status',
    'note',
    'createdAt',
    'updatedAt',
];

@Injectable()
export class CheckInventoryService {
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

    async getCheckInventoryList(query: CheckInventoryQueryStringDto) {
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
                CheckInventory,
                {
                    select: CheckInventoryAttribute,
                    relations: ['warehouseStaff'],
                    where: (queryBuilder) =>
                        this.generateQueryBuilder(queryBuilder, {
                            keyword,
                        }),
                    order: {
                        [orderBy]: orderDirection.toUpperCase(),
                    },
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

    async getCheckInventoryDetail(
        id: number,
    ): Promise<CheckInventoryDetailResponseDto> {
        try {
            const checkInventory = await this.dbManager.findOne(
                CheckInventory,
                {
                    select: CheckInventoryAttribute,
                    where: { id },
                },
            );
            return checkInventory;
        } catch (error) {
            throw error;
        }
    }

    async createCheckInventory(
        checkInventory: CreateCheckInventoryDto,
    ): Promise<CheckInventoryDetailResponseDto> {
        try {
            const insertedMaterial = await this.dbManager
                .getRepository(CheckInventory)
                .insert(checkInventory);
            const checkInventoryId = insertedMaterial?.identifiers[0]?.id;
            if (checkInventoryId) {
                const checkInventoryDetail = await this.getCheckInventoryDetail(
                    checkInventoryId,
                );
                return checkInventoryDetail;
            }
            throw new InternalServerErrorException();
        } catch (error) {
            throw error;
        }
    }

    async updateCheckInventoryStatus(
        id: number,
        updateCheckInventory: UpdateCheckInventoryDto,
    ) {
        try {
            await this.dbManager.update(
                CheckInventory,
                id,
                updateCheckInventory,
            );
            const savedMaterial = await this.getCheckInventoryDetail(id);
            return savedMaterial;
        } catch (error) {
            throw error;
        }
    }

    async checkCanCreateInventory() {
        try {
            const count = await this.dbManager.count(CheckInventory, {
                select: CheckInventoryAttribute,
                where: {
                    status: AcceptStatus.WAITING_APPROVE,
                },
            });
            return count === 0;
        } catch (error) {
            throw error;
        }
    }

    async checkCanApproveInventory(checkInventoryId: number) {
        try {
            const count = await this.dbManager.count(CheckInventoryDetail, {
                where: {
                    status: Not(AcceptStatus.APPROVE),
                    checkInventoryId,
                },
            });
            return count === 0;
        } catch (error) {
            throw error;
        }
    }

    async updateQuantityMaterialInWareHouse(checkInventoryId: number) {
        try {
            const materials = await this.dbManager.find(CheckInventoryDetail, {
                where: { checkInventoryId, status: AcceptStatus.APPROVE },
            });
            materials.forEach(async (element) => {
                await this.dbManager.update(
                    Material,
                    {
                        id: element.materialId,
                    },
                    {
                        quantity: element.inventoryQuantity,
                    },
                );
            });
        } catch (error) {
            throw error;
        }
    }
}
