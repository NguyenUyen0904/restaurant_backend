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
import { OrderBy } from '../check_inventory_detail.constant';
import { AcceptStatus } from 'src/modules/common/common.constant';

export const CheckInventoryDetailListQueryStringSchema = Joi.object().keys({
    page: Joi.number().min(MIN_PAGE).max(MAX_PAGE).optional(),
    limit: Joi.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).optional(),
    keyword: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
    checkInventoryId: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    orderBy: Joi.string()
        .optional()
        .allow(null, '')
        .valid(...Object.values(OrderBy)),
    orderDirection: Joi.string()
        .valid(...Object.values(ORDER_DIRECTION))
        .optional()
        .allow(null, ''),
});

export const CheckInventoryDetailSchema = {
    materialId: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    inventoryQuantity: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    damagedQuantity: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    note: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
    checkInventoryId: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    status: Joi.string()
        .valid(...Object.values(AcceptStatus))
        .optional()
        .allow(null, ''),
};

export const CreateCheckInventoryDetailSchema = Joi.object().keys({
    ...CheckInventoryDetailSchema,
});

export const UpdateCheckInventoryDetailSchema = Joi.object().keys({
    ...CheckInventoryDetailSchema,
});

export class CheckInventoryDetailQueryStringDto {
    page?: number;
    limit?: number;
    keyword?: string;
    orderBy?: OrderBy;
    orderDirection?: ORDER_DIRECTION;
    checkInventoryId?: number;
}

export class CreateCheckInventoryDetailDto {
    materialId: number;
    inventoryQuantity: number;
    damagedQuantity: number;
    note: string;
    checkInventoryId: number;
    status: AcceptStatus;
    createdBy?: number;
}

export class UpdateCheckInventoryDetailDto {
    status?: AcceptStatus;
    updatedBy?: number;
}

export class CheckInventoryDetailDetailResponseDto {
    id: number;
    materialId: number;
    inventoryQuantity: number;
    damagedQuantity: number;
    note: string;
    checkInventoryId: number;
    status: AcceptStatus;
    createdBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
