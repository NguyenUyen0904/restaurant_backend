import {
    Inject,
    Injectable,
    InternalServerErrorException,
    Optional,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Supplier } from '../entity/supplier.entity';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    DEFAULT_ORDER_BY,
    ORDER_DIRECTION,
} from 'src/common/constants';
import { Brackets, EntityManager, Like } from 'typeorm';
import {
    SupplierQueryStringDto,
    SupplierDetailResponseDto,
    CreateSupplierDto,
    UpdateSupplierDto,
} from '../dto/supplier.dto';

const SupplierAttribute: (keyof Supplier)[] = [
    'id',
    'name',
    'phone',
    'address',
    'updatedAt',
];
@Injectable()
export class SupplierService {
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
                            name: Like(likeKeyword),
                        },
                    ]);
                }),
            );
        }
    }

    async getSupplierList(query: SupplierQueryStringDto) {
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
                Supplier,
                {
                    select: SupplierAttribute,
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

    async getSupplierDetail(id: number): Promise<SupplierDetailResponseDto> {
        try {
            const supplier = await this.dbManager.findOne(Supplier, {
                select: SupplierAttribute,
                where: { id },
            });
            return supplier;
        } catch (error) {
            throw error;
        }
    }

    async createSupplier(
        supplier: CreateSupplierDto,
    ): Promise<SupplierDetailResponseDto> {
        try {
            const insertedSupplier = await this.dbManager
                .getRepository(Supplier)
                .insert(supplier);
            const supplierId = insertedSupplier?.identifiers[0]?.id;
            if (supplierId) {
                const supplierDetail = await this.getSupplierDetail(supplierId);
                return supplierDetail;
            }
            throw new InternalServerErrorException();
        } catch (error) {
            throw error;
        }
    }

    async updateSupplier(id: number, supplier: UpdateSupplierDto) {
        try {
            await this.dbManager
                .getRepository(Supplier)
                .update({ id }, supplier);
            const updatedSupplier = await this.getSupplierDetail(id);
            return updatedSupplier;
        } catch (error) {
            throw error;
        }
    }

    async updateSupplierStatus(id: number, updatedSupplier: UpdateSupplierDto) {
        try {
            await this.dbManager.update(Supplier, id, updatedSupplier);
            const savedSupplier = await this.getSupplierDetail(id);
            return savedSupplier;
        } catch (error) {
            throw error;
        }
    }

    async deleteSupplier(id: number, deletedBy: number): Promise<void> {
        try {
            await this.dbManager.update(
                Supplier,
                { id },
                {
                    deletedAt: new Date(),
                    deletedBy,
                },
            );
        } catch (error) {
            throw error;
        }
    }
}
