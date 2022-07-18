import {
    Body,
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { DatabaseService } from 'src/common/services/database.service';
import {
    ErrorResponse,
    SuccessResponse,
} from 'src/common/helpers/api.response';
import {
    AuthorizationGuard,
    Permissions,
} from 'src/common/guards/authorization.guard';
import {
    PermissionResources,
    PermissionActions,
} from 'src/modules/role/role.constants';
import { HttpStatus } from 'src/common/constants';
import { RemoveEmptyQueryPipe } from 'src/common/pipes/remove.empty.query.pipe';
import { TrimObjectPipe } from 'src/common/pipes/trim.object.pipe';
import {
    SupplierListQueryStringSchema,
    SupplierQueryStringDto,
    CreateSupplierSchema,
    CreateSupplierDto,
    UpdateSupplierSchema,
    UpdateSupplierDto,
} from './dto/supplier.dto';
import { Supplier } from './entity/supplier.entity';
import { SupplierService } from './service/supplier.service';

@Controller('supplier')
@UseGuards(JwtGuard, AuthorizationGuard)
export class SupplierController {
    constructor(
        private readonly supplierService: SupplierService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
    ) {}

    @Get()
    @Permissions([
        `${PermissionResources.STORE_SUPPLIER}_${PermissionActions.READ}`,
    ])
    async getSuppliers(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(SupplierListQueryStringSchema),
        )
        query: SupplierQueryStringDto,
    ) {
        try {
            const supplierList = await this.supplierService.getSupplierList(
                query,
            );
            return new SuccessResponse(supplierList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @Permissions([
        `${PermissionResources.STORE_SUPPLIER}_${PermissionActions.READ}`,
    ])
    async getSupplier(@Param('id', ParseIntPipe) id: number) {
        try {
            const supplier = await this.supplierService.getSupplierDetail(id);
            if (!supplier) {
                const message = await this.i18n.translate(
                    'supplier.message.supplierNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            return new SuccessResponse(supplier);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post()
    @Permissions([
        `${PermissionResources.STORE_SUPPLIER}_${PermissionActions.CREATE}`,
    ])
    async createSupplier(
        @Request() req,
        @Body(new TrimObjectPipe(), new JoiValidationPipe(CreateSupplierSchema))
        body: CreateSupplierDto,
    ) {
        try {
            body.createdBy = req.loginUser.id;
            const newSupplier = await this.supplierService.createSupplier(body);
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: {},
                newValue: { ...newSupplier },
            });
            return new SuccessResponse(newSupplier);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    @Permissions([
        `${PermissionResources.STORE_SUPPLIER}_${PermissionActions.UPDATE}`,
    ])
    async updateSupplier(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(new TrimObjectPipe(), new JoiValidationPipe(UpdateSupplierSchema))
        body: UpdateSupplierDto,
    ) {
        try {
            const oldSupplier = await this.databaseService.getDataById(
                Supplier,
                id,
            );
            if (!oldSupplier) {
                const message = await this.i18n.translate(
                    'supplier.message.supplierNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            const supplier = await this.supplierService.updateSupplier(
                id,
                body,
            );
            const newValue = await this.databaseService.getDataById(
                Supplier,
                id,
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldSupplier },
                newValue: { ...newValue },
            });
            return new SuccessResponse(supplier);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Delete(':id')
    @Permissions([
        `${PermissionResources.STORE_SUPPLIER}_${PermissionActions.DELETE}`,
    ])
    async deleteSupplier(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        try {
            const oldSupplier = await this.databaseService.getDataById(
                Supplier,
                id,
            );
            if (!oldSupplier) {
                const message = await this.i18n.translate(
                    'supplier.message.supplierNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            await this.supplierService.deleteSupplier(id, req.loginUser.id);

            const message = await this.i18n.translate(
                'supplier.message.supplierSuccess',
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldSupplier },
                newValue: {},
            });
            return new SuccessResponse({ id }, message);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
