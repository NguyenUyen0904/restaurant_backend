import { BookingService } from './../booking/services/booking.service';
import { TableDiagramService } from './services/tableDiagram.service';
import {
    Controller,
    Get,
    InternalServerErrorException,
    Query,
    Post,
    UseGuards,
    Body,
    Delete,
    Param,
    ParseIntPipe,
    Patch,
    Request,
} from '@nestjs/common';
import { I18nRequestScopeService } from 'nestjs-i18n';
import {
    SuccessResponse,
    ErrorResponse,
} from '../../common/helpers/api.response';

import { JoiValidationPipe } from '../../common/pipes/joi.validation.pipe';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { DatabaseService } from '../../common/services/database.service';
import {
    CreateTableDto,
    CreateTableSchema,
} from './dto/requests/create-tablesRestaurant.dto';
import {
    TableListQueryStringDto,
    TableListQueryStringSchema,
} from './dto/requests/list-tablesRestaurant.dto';
import {
    UpdateTableDto,
    UpdateTableSchema,
} from './dto/requests/update-tablesRestaurant.dto';
import { TablesRestaurant } from './entity/tablesRestaurant.entity';
import {
    AuthorizationGuard,
    Permissions,
} from 'src/common/guards/authorization.guard';
import { HttpStatus } from 'src/common/constants';
import { RemoveEmptyQueryPipe } from 'src/common/pipes/remove.empty.query.pipe';
import { TrimObjectPipe } from 'src/common/pipes/trim.object.pipe';
import { TableStatus } from './tableDiagram.constant';
import { PermissionResources, PermissionActions } from '../role/role.constants';

@Controller('table')
@UseGuards(JwtGuard, AuthorizationGuard)
export class TableDiagramController {
    constructor(
        private readonly tableDiagramService: TableDiagramService,
        private readonly bookingService: BookingService,
        private readonly databaseService: DatabaseService,
        private readonly i18n: I18nRequestScopeService,
    ) {}

    @Get()
    @Permissions([
        `${PermissionResources.TABLE_DIAGRAM}_${PermissionActions.READ}`,
    ])
    async getTables(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(TableListQueryStringSchema),
        )
        query: TableListQueryStringDto,
    ) {
        try {
            const tableList = await this.tableDiagramService.getTableList(
                query,
            );
            return new SuccessResponse(tableList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @Permissions([
        `${PermissionResources.TABLE_DIAGRAM}_${PermissionActions.READ}`,
    ])
    async getTable(@Param('id', ParseIntPipe) id: number) {
        try {
            const table = await this.tableDiagramService.getTableDetail(id);
            if (!table) {
                const message = await this.i18n.translate(
                    'table.message.error.itemNotExist',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            return new SuccessResponse(table);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post()
    @Permissions([
        `${PermissionResources.TABLE_DIAGRAM}_${PermissionActions.CREATE}`,
    ])
    async create(
        @Request() req,
        @Body(new TrimObjectPipe(), new JoiValidationPipe(CreateTableSchema))
        body: CreateTableDto,
    ) {
        try {
            body.createdBy = req.loginUser.id;
            body.status = TableStatus.READY;
            const newTable = await this.tableDiagramService.createTable(body);
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: {},
                newValue: { ...newTable },
            });
            return new SuccessResponse(newTable);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    @Permissions([
        `${PermissionResources.TABLE_DIAGRAM}_${PermissionActions.UPDATE}`,
    ])
    async updateTable(
        @Request() req,
        @Param('id') id: number,
        @Body(new TrimObjectPipe(), new JoiValidationPipe(UpdateTableSchema))
        body: UpdateTableDto,
    ) {
        try {
            const oldTable = await this.databaseService.getDataById(
                TablesRestaurant,
                id,
            );
            if (!oldTable) {
                const message = await this.i18n.translate(
                    'table.message.error.itemNotExist',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            body.updatedBy = req.loginUser.id;
            const isExistBookingWaiting =
                await this.bookingService.checkExistBookingWaitingInTable(id);
            if (body.status === TableStatus.READY && isExistBookingWaiting) {
                body.status = TableStatus.BOOKED;
            }
            const updatedTable = await this.tableDiagramService.updateTable(
                id,
                body,
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldTable },
                newValue: { ...updatedTable },
            });
            return new SuccessResponse(updatedTable);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Delete(':id')
    @Permissions([
        `${PermissionResources.TABLE_DIAGRAM}_${PermissionActions.DELETE}`,
    ])
    async deleteTable(@Request() req, @Param('id', ParseIntPipe) id: number) {
        try {
            const oldTable = await this.databaseService.getDataById(
                TablesRestaurant,
                id,
            );
            if (!oldTable) {
                const message = await this.i18n.translate(
                    'table.message.error.itemNotExist',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }

            await this.tableDiagramService.deleteTable(id, req.loginUser.id);
            const message = await this.i18n.translate(
                'table.message.success.delete',
            );

            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldTable },
                newValue: {},
            });
            return new SuccessResponse({ id }, message);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
