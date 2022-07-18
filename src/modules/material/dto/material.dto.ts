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
import { OrderBy } from '../material.constant';

export const MaterialListQueryStringSchema = Joi.object().keys({
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
});

export const MaterialSchema = {
    material: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional()
        .allow(null, ''),
    unit: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
    quantity: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
};

export const UpdateMaterialSchema = Joi.object().keys({
    ...MaterialSchema,
});

export const CreateMaterialSchema = Joi.object().keys({
    ...MaterialSchema,
});

export class MaterialQueryStringDto {
    page?: number;
    limit?: number;
    keyword?: string;
    orderBy?: OrderBy;
    orderDirection?: ORDER_DIRECTION;
}

export class CreateMaterialDto {
    material: string;
    unit?: string;
    quantity: number;
    createdBy: number;
}

export class UpdateMaterialDto {
    material?: string;
    unit?: string;
    quantity?: number;
    updatedBy?: number;
}

export class MaterialDetailResponseDto {
    id: number;
    material: string;
    unit?: string;
    quantity: number;
    createdBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
