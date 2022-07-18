import { BookingService } from './../booking/services/booking.service';
import { SuccessResponse } from 'src/common/helpers/api.response';
import {
    Controller,
    Get,
    InternalServerErrorException,
    UseGuards,
    Query,
    Body,
    Post,
} from '@nestjs/common';
import { JoiValidationPipe } from '../../common/pipes/joi.validation.pipe';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { queryDropdownSchema } from './dto/request/dropdown.dto';

import { CommonDropdownService } from './services/common-dropdown.service';
import {
    ListBankDropdown,
    ListMaterialDropdown,
    ListProvinceDropdown,
    ListRoleDropdown,
    ListSupplierDropdown,
    ListUserDropdown,
} from './dto/responses/user-dropdown-response.dto';
import { QueryDropdown } from './dto/request/dropdown.dto';
import {
    AuthorizationGuard,
    Permissions,
} from 'src/common/guards/authorization.guard';
import { RemoveEmptyQueryPipe } from 'src/common/pipes/remove.empty.query.pipe';

import {
    PermissionResources,
    PermissionActions,
} from 'src/modules/role/role.constants';
import { TrimObjectPipe } from 'src/common/pipes/trim.object.pipe';
import { BookingStatus } from '../booking/booking.constant';
import {
    CreateBookingSchema,
    CreateBookingDto,
} from '../booking/dto/requests/create-booking.dto';
import { DatabaseService } from 'src/common/services/database.service';

@Controller('common')
export class CommonController {
    constructor(
        private readonly commonDropdownService: CommonDropdownService,
        private readonly bookingService: BookingService,
        private readonly databaseService: DatabaseService,
    ) {}

    @Get('/province')
    @UseGuards(JwtGuard)
    async getProvinces(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(queryDropdownSchema),
        )
        query: QueryDropdown,
    ) {
        try {
            const listProvince: ListProvinceDropdown =
                await this.commonDropdownService.getListProvince(query);

            return new SuccessResponse(listProvince);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/user')
    @UseGuards(JwtGuard, AuthorizationGuard)
    @Permissions([`${PermissionResources.USER}_${PermissionActions.READ}`])
    async getUsers(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(queryDropdownSchema),
        )
        query: QueryDropdown,
    ) {
        try {
            const listUserDropdown: ListUserDropdown =
                await this.commonDropdownService.getListUser(query);
            return new SuccessResponse(listUserDropdown);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/role')
    @UseGuards(JwtGuard, AuthorizationGuard)
    @Permissions([`${PermissionResources.USER}_${PermissionActions.READ}`])
    async getRoles(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(queryDropdownSchema),
        )
        query: QueryDropdown,
    ) {
        try {
            const listRoleDropdown: ListRoleDropdown =
                await this.commonDropdownService.getListRole(query);
            return new SuccessResponse(listRoleDropdown);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/bank')
    @UseGuards(JwtGuard)
    async getBanks(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(queryDropdownSchema),
        )
        query: QueryDropdown,
    ) {
        try {
            const data: ListBankDropdown =
                await this.commonDropdownService.getListBank(query);
            return new SuccessResponse(data);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/material')
    @UseGuards(JwtGuard)
    async getMaterials(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(queryDropdownSchema),
        )
        query: QueryDropdown,
    ) {
        try {
            const data: ListMaterialDropdown =
                await this.commonDropdownService.getListMaterial(query);
            return new SuccessResponse(data);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('booking')
    async createBooking(
        @Body(new TrimObjectPipe(), new JoiValidationPipe(CreateBookingSchema))
        body: CreateBookingDto,
    ) {
        try {
            body.status = BookingStatus.WAITING;
            const newBooking = await this.bookingService.createBooking(body);
            return new SuccessResponse(newBooking);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/supplier')
    @UseGuards(JwtGuard)
    async getSuppliers(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(queryDropdownSchema),
        )
        query: QueryDropdown,
    ) {
        try {
            const data: ListSupplierDropdown =
                await this.commonDropdownService.getListSupplier(query);
            return new SuccessResponse(data);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
