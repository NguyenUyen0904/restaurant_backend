import { PromotionStatus } from './../promotion.constant';
import { MAX_INTEGER } from '../../../common/constants';
import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);
import {
    INPUT_TEXT_MAX_LENGTH,
    MAX_PAGE,
    MAX_PAGE_SIZE,
    MIN_PAGE,
    MIN_PAGE_SIZE,
    ORDER_DIRECTION,
} from 'src/common/constants';
import { OrderBy } from '../promotion.constant';

export const PromotionListQueryStringSchema = Joi.object().keys({
    page: Joi.number().min(MIN_PAGE).max(MAX_PAGE).optional(),
    limit: Joi.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).optional(),
    keyword: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
    orderBy: Joi.string()
        .optional()
        .allow(null, '')
        .valid(...Object.values(OrderBy)),
    orderDirection: Joi.string()
        .valid(...Object.values(ORDER_DIRECTION))
        .optional()
        .allow(null, ''),
    status: Joi.string()
        .valid(...Object.values(PromotionStatus))
        .optional()
        .allow(null, ''),
});

export const PromotionSchema = {
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
    note: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
    percent: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    status: Joi.string()
        .valid(...Object.values(PromotionStatus))
        .optional()
        .allow(null, ''),
};

export const CreatePromotionSchema = Joi.object().keys({
    ...PromotionSchema,
});

export const UpdatePromotionSchema = Joi.object().keys({
    ...PromotionSchema,
});

export class PromotionQueryStringDto {
    page?: number;
    limit?: number;
    keyword?: string;
    orderBy?: OrderBy;
    orderDirection?: ORDER_DIRECTION;
    status: PromotionStatus;
}

export class CreatePromotionDto {
    name: string;
    percent: number;
    note?: string;
    status: PromotionStatus;
    createdBy?: number;
}

export class UpdatePromotionDto {
    name?: string;
    percent?: number;
    note?: string;
    status?: PromotionStatus;
    updatedAt?: Date;
}

export class PromotionDetailResponseDto {
    id: number;
    name: string;
    percent: number;
    note?: string;
    status: PromotionStatus;
    createdBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
