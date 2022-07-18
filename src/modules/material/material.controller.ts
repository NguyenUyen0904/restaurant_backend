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
    CreateMaterialDto,
    CreateMaterialSchema,
    MaterialListQueryStringSchema,
    MaterialQueryStringDto,
    UpdateMaterialDto,
    UpdateMaterialSchema,
} from './dto/material.dto';
import { Material } from './entity/material.entity';
import { MaterialService } from './service/material.service';

@Controller('material')
@UseGuards(JwtGuard, AuthorizationGuard)
export class MaterialController {
    constructor(
        private readonly materialService: MaterialService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
    ) {}

    @Get()
    @Permissions([
        `${PermissionResources.STORE_MATERIAL}_${PermissionActions.READ}`,
    ])
    async getMaterials(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(MaterialListQueryStringSchema),
        )
        query: MaterialQueryStringDto,
    ) {
        try {
            const materialList = await this.materialService.getMaterialList(
                query,
            );
            return new SuccessResponse(materialList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @Permissions([
        `${PermissionResources.STORE_MATERIAL}_${PermissionActions.READ}`,
    ])
    async getMaterial(@Param('id', ParseIntPipe) id: number) {
        try {
            const material = await this.materialService.getMaterialDetail(id);
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
        `${PermissionResources.STORE_MATERIAL}_${PermissionActions.CREATE}`,
    ])
    async createMaterial(
        @Request() req,
        @Body(new TrimObjectPipe(), new JoiValidationPipe(CreateMaterialSchema))
        body: CreateMaterialDto,
    ) {
        try {
            body.createdBy = req.loginUser.id;
            const newMaterial = await this.materialService.createMaterial(body);
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: {},
                newValue: { ...newMaterial },
            });
            return new SuccessResponse(newMaterial);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    @Permissions([
        `${PermissionResources.STORE_MATERIAL}_${PermissionActions.UPDATE}`,
    ])
    async updateMaterial(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(new TrimObjectPipe(), new JoiValidationPipe(UpdateMaterialSchema))
        body: UpdateMaterialDto,
    ) {
        try {
            const oldMaterial = await this.databaseService.getDataById(
                Material,
                id,
            );
            if (!oldMaterial) {
                const message = await this.i18n.translate(
                    'material.message.materialNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            const material = await this.materialService.updateMaterial(
                id,
                body,
            );
            const newValue = await this.databaseService.getDataById(
                Material,
                id,
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldMaterial },
                newValue: { ...newValue },
            });
            return new SuccessResponse(material);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Delete(':id')
    @Permissions([
        `${PermissionResources.STORE_MATERIAL}_${PermissionActions.DELETE}`,
    ])
    async deleteMaterial(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        try {
            const oldMaterial = await this.databaseService.getDataById(
                Material,
                id,
            );
            if (!oldMaterial) {
                const message = await this.i18n.translate(
                    'material.message.materialNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            await this.materialService.deleteMaterial(id, req.loginUser.id);

            const message = await this.i18n.translate(
                'material.message.materialSuccess',
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldMaterial },
                newValue: {},
            });
            return new SuccessResponse({ id }, message);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
