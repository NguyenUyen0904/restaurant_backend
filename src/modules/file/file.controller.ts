import {
    Controller,
    Post,
    InternalServerErrorException,
    Body,
    Query,
    UseGuards,
    Get,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import { JwtGuard } from '../../common/guards/jwt.guard';
import {
    registerFileSchema,
    RegisterFileDto,
    PresignedUrlQuerySchema,
    PresignedUrlQueryDto,
} from './dto/request/register-file.dto';
import { JoiValidationPipe } from '../../common/pipes/joi.validation.pipe';
import { FileService } from './services/file.service';
import {
    ErrorResponse,
    SuccessResponse,
} from '../../common/helpers/api.response';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { HttpStatus } from 'src/common/constants';
import { TrimObjectPipe } from 'src/common/pipes/trim.object.pipe';
@Controller('file')
@UseGuards(JwtGuard)
export class FileController {
    constructor(
        private readonly fileService: FileService,
        private readonly i18n: I18nRequestScopeService,
    ) {}

    @Post()
    async create(
        @Body(new TrimObjectPipe(), new JoiValidationPipe(registerFileSchema))
        data: RegisterFileDto,
    ) {
        try {
            const newFile = await this.fileService.createFile(data);
            return new SuccessResponse(newFile);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/presigned-url')
    async getPresignedUrl(
        @Query(new JoiValidationPipe(PresignedUrlQuerySchema))
        query: PresignedUrlQueryDto,
    ) {
        try {
            const result = await this.fileService.getS3PresignedUrl(
                query.path,
                query.originalName,
            );
            return new SuccessResponse(result);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    async getFile(@Param('id', ParseIntPipe) id: number) {
        try {
            const file = await this.fileService.getFileById(id);
            if (!file) {
                const message = await this.i18n.translate(
                    'file.message.error.itemNotExist',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, []);
            }
            return new SuccessResponse(file);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
