import {
    Inject,
    Injectable,
    InternalServerErrorException,
    Optional,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ConvertMaterial } from '../entity/convert_material.entity';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    DEFAULT_ORDER_BY,
    ORDER_DIRECTION,
} from 'src/common/constants';
import { Brackets, EntityManager, Like } from 'typeorm';
import {
    ConvertMaterialDetailResponseDto,
    ConvertMaterialQueryStringDto,
    CreateConvertMaterialDto,
} from '../dto/convert_material.dto';

const ConvertMaterialAttribute: (keyof ConvertMaterial)[] = [
    'id',
    'idMaterialFrom',
    'quantityBeforeConvertFrom',
    'quantityFrom',
    'idMaterialTo',
    'quantityBeforeConvertTo',
    'quantityTo',
    'note',
    'createdAt',
];
@Injectable()
export class ConvertMaterialService {
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
                            note: Like(likeKeyword),
                        },
                    ]);
                }),
            );
        }
    }

    async getConvertHistoryList(query: ConvertMaterialQueryStringDto) {
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
                ConvertMaterial,
                {
                    select: ConvertMaterialAttribute,
                    where: (queryBuilder) =>
                        this.generateQueryBuilder(queryBuilder, {
                            keyword,
                        }),
                    order: {
                        [orderBy]: orderDirection.toUpperCase(),
                    },
                    relations: ['materialTo', 'materialFrom', 'performer'],
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

    async getConvertMaterialDetail(
        id: number,
    ): Promise<ConvertMaterialDetailResponseDto> {
        try {
            const convertMaterial = await this.dbManager.findOne(
                ConvertMaterial,
                {
                    select: ConvertMaterialAttribute,
                    where: { id },
                },
            );
            return convertMaterial;
        } catch (error) {
            throw error;
        }
    }

    async createConvertMaterial(
        convertMaterial: CreateConvertMaterialDto,
    ): Promise<ConvertMaterialDetailResponseDto> {
        try {
            const insertedConvertMaterial = await this.dbManager
                .getRepository(ConvertMaterial)
                .insert(convertMaterial);
            const convertMaterialId =
                insertedConvertMaterial?.identifiers[0]?.id;
            if (convertMaterialId) {
                const convertMaterialDetail =
                    await this.getConvertMaterialDetail(convertMaterialId);
                return convertMaterialDetail;
            }
            throw new InternalServerErrorException();
        } catch (error) {
            throw error;
        }
    }
}
