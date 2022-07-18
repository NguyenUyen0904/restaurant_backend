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
import { OrderBy } from '../convert_material.constant';

export const ConvertHistoriesQueryStringSchema = Joi.object().keys({
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

export const ConvertMaterialSchema = {
    idMaterialFrom: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    quantityBeforeConvertFrom: Joi.number()
        .max(MAX_INTEGER)
        .optional()
        .allow(null, ''),
    quantityFrom: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    idMaterialTo: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    quantityBeforeConvertTo: Joi.number()
        .max(MAX_INTEGER)
        .optional()
        .allow(null, ''),
    quantityTo: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    note: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
};

export const CreateConvertMaterialSchema = Joi.object().keys({
    ...ConvertMaterialSchema,
});

export class ConvertMaterialQueryStringDto {
    page?: number;
    limit?: number;
    keyword?: string;
    orderBy?: OrderBy;
    orderDirection?: ORDER_DIRECTION;
}

export class CreateConvertMaterialDto {
    idMaterialFrom: number;
    quantityBeforeConvertFrom: number;
    quantityFrom: number;
    idMaterialTo: number;
    quantityBeforeConvertTo: number;
    quantityTo: number;
    note: string;
    createdBy: number;
}

export class ConvertMaterialDetailResponseDto {
    id: number;
    idMaterialFrom: number;
    quantityBeforeConvertFrom: number;
    quantityFrom: number;
    idMaterialTo: number;
    quantityBeforeConvertTo: number;
    quantityTo: number;
    note: string;
    createdBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
