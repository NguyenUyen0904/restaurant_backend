import {
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    Param,
    ParseIntPipe,
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
    ConvertHistoriesQueryStringSchema,
    ConvertMaterialQueryStringDto,
    CreateConvertMaterialDto,
    CreateConvertMaterialSchema,
} from './dto/convert_material.dto';
import { ConvertMaterialService } from './service/convert_material.service';
import { MaterialService } from '../material/service/material.service';

@Controller('convert-material')
@UseGuards(JwtGuard, AuthorizationGuard)
export class ConvertMaterialController {
    constructor(
        private readonly convertMaterialService: ConvertMaterialService,
        private readonly materialService: MaterialService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
    ) {}

    @Get()
    @Permissions([
        `${PermissionResources.STORE_CONVERT}_${PermissionActions.READ}`,
    ])
    async getConvertHistories(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(ConvertHistoriesQueryStringSchema),
        )
        query: ConvertMaterialQueryStringDto,
    ) {
        try {
            const convertHistories =
                await this.convertMaterialService.getConvertHistoryList(query);
            return new SuccessResponse(convertHistories);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @Permissions([
        `${PermissionResources.STORE_CONVERT}_${PermissionActions.READ}`,
    ])
    async getConvertMaterial(@Param('id', ParseIntPipe) id: number) {
        try {
            const convertMaterial =
                await this.convertMaterialService.getConvertMaterialDetail(id);
            if (!convertMaterial) {
                const message = await this.i18n.translate(
                    'material.message.materialNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            return new SuccessResponse(convertMaterial);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post()
    @Permissions([
        `${PermissionResources.STORE_MATERIAL}_${PermissionActions.CONVERT_MATERIAL}`,
    ])
    async createConvertMaterial(
        @Request() req,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(CreateConvertMaterialSchema),
        )
        body: CreateConvertMaterialDto,
    ) {
        try {
            body.createdBy = req.loginUser.id;
            await this.materialService.updateMaterial(body.idMaterialFrom, {
                quantity: body.quantityBeforeConvertFrom - body.quantityFrom,
            });
            await this.materialService.updateMaterial(body.idMaterialTo, {
                quantity:
                    parseFloat(
                        body.quantityBeforeConvertTo as unknown as string,
                    ) + parseFloat(body.quantityTo as unknown as string),
            });
            const newConvertMaterial =
                await this.convertMaterialService.createConvertMaterial(body);
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: {},
                newValue: { ...newConvertMaterial },
            });
            return new SuccessResponse(newConvertMaterial);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
