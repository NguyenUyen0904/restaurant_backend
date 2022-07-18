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
import { OrderBy } from '../supplier.constant';

export const SupplierListQueryStringSchema = Joi.object().keys({
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

export const SupplierSchema = {
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
    phone: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
    address: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
};

export const UpdateSupplierSchema = Joi.object().keys({
    ...SupplierSchema,
});

export const CreateSupplierSchema = Joi.object().keys({
    ...SupplierSchema,
});

export class SupplierQueryStringDto {
    page?: number;
    limit?: number;
    keyword?: string;
    orderBy?: OrderBy;
    orderDirection?: ORDER_DIRECTION;
}

export class CreateSupplierDto {
    name: string;
    phone?: string;
    address: string;
    createdBy: number;
}

export class UpdateSupplierDto {
    name: string;
    phone?: string;
    address: string;
    updatedBy: number;
}

export class SupplierDetailResponseDto {
    id: number;
    name: string;
    phone?: string;
    address: string;
    createdBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
