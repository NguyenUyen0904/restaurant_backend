import {
    Body,
    Controller,
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
    CreateImportMaterialDto,
    CreateImportMaterialSchema,
    ImportMaterialListQueryStringSchema,
    ImportMaterialQueryStringDto,
    UpdateImportMaterialDto,
    UpdateImportMaterialSchema,
} from './dto/import_material.dto';
import { ImportMaterial } from './entity/import_material.entity';
import { ImportMaterialService } from './service/import_material.service';
import { AcceptStatus } from '../common/common.constant';
import { CommonDropdownService } from '../common/services/common-dropdown.service';
import { ImportMaterialOrderService } from '../import-material-order/service/import_material_order.service';
import { CreateImportMaterialOrderDto } from '../import-material-order/dto/import_material_order.dto';

@Controller('import-material')
@UseGuards(JwtGuard, AuthorizationGuard)
export class ImportMaterialController {
    constructor(
        private readonly importMaterialService: ImportMaterialService,
        private readonly importMaterialOrderService: ImportMaterialOrderService,
        private readonly commonDropdownService: CommonDropdownService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
    ) {}

    @Get()
    @Permissions([
        `${PermissionResources.STORE_IMPORT_MATERIAL}_${PermissionActions.READ}`,
    ])
    async getImportImportMaterials(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(ImportMaterialListQueryStringSchema),
        )
        query: ImportMaterialQueryStringDto,
    ) {
        try {
            const materialList =
                await this.importMaterialService.getImportMaterialList(query);
            return new SuccessResponse(materialList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @Permissions([
        `${PermissionResources.STORE_IMPORT_MATERIAL}_${PermissionActions.READ}`,
    ])
    async getImportMaterial(@Param('id', ParseIntPipe) id: number) {
        try {
            const material =
                await this.importMaterialService.getImportMaterialDetail(id);
            if (!material) {
                const message = await this.i18n.translate(
                    'material.message.materialNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            return new SuccessResponse(material);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post()
    @Permissions([
        `${PermissionResources.STORE_IMPORT_MATERIAL}_${PermissionActions.CREATE}`,
    ])
    async createImportMaterial(
        @Request() req,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(CreateImportMaterialSchema),
        )
        body: CreateImportMaterialDto,
    ) {
        try {
            body.createdBy = req.loginUser.id;
            body.warehouseStaffId = req.loginUser.id;
            body.status = AcceptStatus.WAITING_APPROVE;
            const newImportMaterial =
                await this.importMaterialService.createImportMaterial(body);
            const materials = this.commonDropdownService.getListMaterial({});
            const importBody = (await materials).items.map(
                (item) =>
                    ({
                        materialId: item.id,
                        pricePerUnit: 0,
                        quantity: 0,
                        note: '',
                        importMaterialId: newImportMaterial.id,
                        status: AcceptStatus.APPROVE,
                    } as CreateImportMaterialOrderDto),
            );
            await this.importMaterialOrderService.bulkCreateImportMaterialOrders(
                importBody,
            );
            return new SuccessResponse(newImportMaterial);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    @Permissions([
        `${PermissionResources.STORE_IMPORT_MATERIAL}_${PermissionActions.UPDATE}`,
    ])
    async updateImportMaterialStatus(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(UpdateImportMaterialSchema),
        )
        body: UpdateImportMaterialDto,
    ) {
        try {
            const oldImportMaterial = await this.databaseService.getDataById(
                ImportMaterial,
                id,
            );
            if (!oldImportMaterial) {
                const message = await this.i18n.translate(
                    'material.message.materialNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            const material =
                await this.importMaterialService.updateImportMaterialStatus(
                    id,
                    body,
                );
            const newValue = await this.databaseService.getDataById(
                ImportMaterial,
                id,
            );
            if (
                body.status === AcceptStatus.APPROVE &&
                oldImportMaterial.status != AcceptStatus.APPROVE
            ) {
                this.importMaterialService.updateQuantityMaterialInWareHouse(
                    id,
                );
                this.importMaterialService.updateTotalPayment(id);
            }
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldImportMaterial },
                newValue: { ...newValue },
            });
            return new SuccessResponse(material);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
