import { TableDiagramService } from './../table-diagram/services/tableDiagram.service';
import { BookingStatus } from './booking.constant';
import {
    UpdateBookingSchema,
    UpdateBookingDto,
} from './dto/requests/update-booking.dto';
import { BookingService } from './services/booking.service';
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
    CreateBookingDto,
    CreateBookingSchema,
} from './dto/requests/create-booking.dto';
import {
    BookingListQueryStringDto,
    BookingListQueryStringSchema,
} from './dto/requests/list-booking.dto';
import { Booking } from './entity/booking.entity';
import { AuthorizationGuard } from 'src/common/guards/authorization.guard';
import { HttpStatus } from 'src/common/constants';
import { RemoveEmptyQueryPipe } from 'src/common/pipes/remove.empty.query.pipe';
import { TrimObjectPipe } from 'src/common/pipes/trim.object.pipe';

@Controller({
    path: 'booking',
})
@UseGuards(JwtGuard, AuthorizationGuard)
export class BookingController {
    constructor(
        private readonly bookingService: BookingService,
        private readonly tableDiagramService: TableDiagramService,
        private readonly databaseService: DatabaseService,
        private readonly i18n: I18nRequestScopeService,
    ) {}

    @Get()
    async getBookings(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(BookingListQueryStringSchema),
        )
        query: BookingListQueryStringDto,
    ) {
        try {
            const bookingList = await this.bookingService.getBookingList(query);
            return new SuccessResponse(bookingList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    async getBookingDetail(@Param('id', ParseIntPipe) id: number) {
        try {
            const booking = await this.bookingService.getBookingDetail(id);
            if (!booking) {
                const message = await this.i18n.translate(
                    'booking.message.error.itemNotExist',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            return new SuccessResponse(booking);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post()
    async create(
        @Request() req,
        @Body(new TrimObjectPipe(), new JoiValidationPipe(CreateBookingSchema))
        body: CreateBookingDto,
    ) {
        try {
            body.createdBy = req.loginUser.id;
            body.status = BookingStatus.WAITING;
            const newBooking = await this.bookingService.createBooking(body);
            const isExistBookingWaiting =
                await this.bookingService.checkExistBookingWaitingInTable(
                    body.tableId,
                );
            this.tableDiagramService.updateStatusTableRelativeBooking(
                body.tableId,
                body.status,
                isExistBookingWaiting,
            );
            return new SuccessResponse(newBooking);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    async updateBooking(
        @Request() req,
        @Param('id') id: number,
        @Body(new TrimObjectPipe(), new JoiValidationPipe(UpdateBookingSchema))
        body: UpdateBookingDto,
    ) {
        try {
            const oldBooking = await this.databaseService.getDataById(
                Booking,
                id,
            );
            if (!oldBooking) {
                const message = await this.i18n.translate(
                    'booking.message.error.itemNotExist',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            body.updatedBy = req.loginUser.id;
            const updatedBooking = await this.bookingService.updateBooking(
                id,
                body,
            );
            const isExistBookingWaiting =
                await this.bookingService.checkExistBookingWaitingInTable(
                    updatedBooking.tableId,
                );
            await this.tableDiagramService.updateStatusTableRelativeBooking(
                updatedBooking.tableId,
                updatedBooking.status,
                isExistBookingWaiting,
            );
            return new SuccessResponse(updatedBooking);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Delete(':id')
    async deleteBooking(@Request() req, @Param('id', ParseIntPipe) id: number) {
        try {
            const oldBooking = await this.databaseService.getDataById(
                Booking,
                id,
            );
            if (!oldBooking) {
                const message = await this.i18n.translate(
                    'booking.message.error.itemNotExist',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }

            await this.bookingService.deleteBooking(id, req.loginUser.id);
            const message = await this.i18n.translate(
                'booking.message.success.delete',
            );

            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldBooking },
                newValue: {},
            });
            return new SuccessResponse({ id }, message);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
