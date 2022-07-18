import { TableStatus } from './../../tableDiagram.constant';
import { TableSchema } from '../../tableDiagram.constant';
import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);
export interface CreateTableDto {
    name: string;
    numberPeople: number;
    status: TableStatus;
    createdBy: number;
}

export const CreateTableSchema = Joi.object().keys({
    ...TableSchema,
});
