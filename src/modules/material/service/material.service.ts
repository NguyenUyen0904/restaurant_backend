import {
    Inject,
    Injectable,
    InternalServerErrorException,
    Optional,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Material } from '../entity/material.entity';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    DEFAULT_ORDER_BY,
    ORDER_DIRECTION,
} from 'src/common/constants';
import { Brackets, EntityManager, Like } from 'typeorm';
import {
    CreateMaterialDto,
    MaterialDetailResponseDto,
    MaterialQueryStringDto,
    UpdateMaterialDto,
} from '../dto/material.dto';

const MaterialAttribute: (keyof Material)[] = [
    'id',
    'material',
    'unit',
    'quantity',
    'updatedAt',
];
@Injectable()
export class MaterialService {
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

    async getMaterialList(query: MaterialQueryStringDto) {
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
                Material,
                {
                    select: MaterialAttribute,
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

    async getMaterialDetail(id: number): Promise<MaterialDetailResponseDto> {
        try {
            const material = await this.dbManager.findOne(Material, {
                select: MaterialAttribute,
                where: { id },
            });
            return material;
        } catch (error) {
            throw error;
        }
    }

    async createMaterial(
        material: CreateMaterialDto,
    ): Promise<MaterialDetailResponseDto> {
        try {
            const insertedMaterial = await this.dbManager
                .getRepository(Material)
                .insert(material);
            const materialId = insertedMaterial?.identifiers[0]?.id;
            if (materialId) {
                const materialDetail = await this.getMaterialDetail(materialId);
                return materialDetail;
            }
            throw new InternalServerErrorException();
        } catch (error) {
            throw error;
        }
    }

    async updateMaterial(id: number, material: UpdateMaterialDto) {
        try {
            await this.dbManager
                .getRepository(Material)
                .update({ id }, material);
            const updatedMaterial = await this.getMaterialDetail(id);
            return updatedMaterial;
        } catch (error) {
            throw error;
        }
    }

    async updateMaterialStatus(id: number, updatedMaterial: UpdateMaterialDto) {
        try {
            await this.dbManager.update(Material, id, updatedMaterial);
            const savedMaterial = await this.getMaterialDetail(id);
            return savedMaterial;
        } catch (error) {
            throw error;
        }
    }

    async deleteMaterial(id: number, deletedBy: number): Promise<void> {
        try {
            await this.dbManager.update(
                Material,
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
