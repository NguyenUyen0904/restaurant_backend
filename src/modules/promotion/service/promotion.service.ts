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
import { Promotion } from '../entity/promotion.entity';
import {
    PromotionQueryStringDto,
    PromotionDetailResponseDto,
    CreatePromotionDto,
    UpdatePromotionDto,
} from '../dto/promotion.dto';
import { File } from 'src/modules/file/entity/file.entity';
import { makeFileUrl } from 'src/common/helpers/common.function';

const PromotionAttribute: (keyof Promotion)[] = [
    'id',
    'name',
    'percent',
    'note',
    'createdAt',
];

@Injectable()
export class PromotionService {
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

    async getPromotionList(query: PromotionQueryStringDto) {
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
                Promotion,
                {
                    select: PromotionAttribute,
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

    async getPromotionDetail(id: number): Promise<PromotionDetailResponseDto> {
        try {
            const promotion = await this.dbManager.findOne(Promotion, {
                select: PromotionAttribute,
                where: { id },
            });
            return promotion;
        } catch (error) {
            throw error;
        }
    }

    async createPromotion(
        promotion: CreatePromotionDto,
    ): Promise<PromotionDetailResponseDto> {
        try {
            const insertedPromotion = await this.dbManager
                .getRepository(Promotion)
                .insert(promotion);
            const promotionId = insertedPromotion?.identifiers[0]?.id;
            if (promotionId) {
                const promotionDetail = await this.getPromotionDetail(
                    promotionId,
                );
                return promotionDetail;
            }
            throw new InternalServerErrorException();
        } catch (error) {
            throw error;
        }
    }

    async updatePromotionStatus(
        id: number,
        updatePromotion: UpdatePromotionDto,
    ) {
        try {
            await this.dbManager.update(Promotion, id, updatePromotion);
            const savedPromotion = await this.getPromotionDetail(id);
            return savedPromotion;
        } catch (error) {
            throw error;
        }
    }

    async deletePromotion(id: number, deletedBy: number): Promise<void> {
        try {
            await this.dbManager.update(
                Promotion,
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
