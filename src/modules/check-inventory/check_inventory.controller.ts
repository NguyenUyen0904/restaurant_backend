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
    CreateCheckInventoryDto,
    CreateCheckInventorySchema,
    CheckInventoryListQueryStringSchema,
    CheckInventoryQueryStringDto,
    UpdateCheckInventoryDto,
    UpdateCheckInventorySchema,
} from './dto/check_inventory.dto';
import { CheckInventory } from './entity/check_inventory.entity';
import { CheckInventoryService } from './service/check_inventory.service';

@Controller('check-inventory')
@UseGuards(JwtGuard, AuthorizationGuard)
export class CheckInventoryController {
    constructor(
        private readonly checkInventoryService: CheckInventoryService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
    ) {}

    @Get()
    @Permissions([
        `${PermissionResources.STORE_CHECK_INVENTORY}_${PermissionActions.READ}`,
    ])
    async getExportCheckInventorys(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(CheckInventoryListQueryStringSchema),
        )
        query: CheckInventoryQueryStringDto,
    ) {
        try {
            const materialList =
                await this.checkInventoryService.getCheckInventoryList(query);
            return new SuccessResponse(materialList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @Permissions([
        `${PermissionResources.STORE_CHECK_INVENTORY}_${PermissionActions.READ}`,
    ])
    async getCheckInventory(@Param('id', ParseIntPipe) id: number) {
        try {
            const material =
                await this.checkInventoryService.getCheckInventoryDetail(id);
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
        `${PermissionResources.STORE_CHECK_INVENTORY}_${PermissionActions.CREATE}`,
    ])
    async createCheckInventory(
        @Request() req,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(CreateCheckInventorySchema),
        )
        body: CreateCheckInventoryDto,
    ) {
        try {
            body.createdBy = req.loginUser.id;
            const newCheckInventory =
                await this.checkInventoryService.createCheckInventory(body);
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: {},
                newValue: { ...newCheckInventory },
            });
            return new SuccessResponse(newCheckInventory);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    @Permissions([
        `${PermissionResources.STORE_CHECK_INVENTORY}_${PermissionActions.UPDATE}`,
    ])
    async updateCheckInventoryStatus(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(UpdateCheckInventorySchema),
        )
        body: UpdateCheckInventoryDto,
    ) {
        try {
            const oldCheckInventory = await this.databaseService.getDataById(
                CheckInventory,
                id,
            );
            if (!oldCheckInventory) {
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
                await this.checkInventoryService.updateCheckInventoryStatus(
                    id,
                    body,
                );
            const newValue = await this.databaseService.getDataById(
                CheckInventory,
                id,
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldCheckInventory },
                newValue: { ...newValue },
            });
            return new SuccessResponse(material);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
