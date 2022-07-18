import { Role } from '../../role/entity/role.entity';
import { HttpStatus } from '../../../common/constants';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Request } from 'express';
import { EntityManager, In } from 'typeorm';

import { User } from 'src/modules/user/entity/user.entity';
import { CreateUserDto, ImportUserDto } from '../dto/requests/create-user.dto';
import { getConnection } from 'typeorm';
import { uniq } from 'lodash';
import { Province } from '../entity/province.entity';
import { userPositionList } from 'src/modules/common/services/global-data.service';
import { I18nRequestScopeService } from 'nestjs-i18n';

@Injectable()
export class ImportUserService {
    constructor(
        @Optional() @Inject(REQUEST) private readonly request: Request,
        @InjectEntityManager()
        private readonly dbManager: EntityManager,
        private readonly i18n: I18nRequestScopeService,
    ) {}
    async getEmails(emails: string[]): Promise<string[]> {
        const users = await this.dbManager.find(User, {
            select: ['email'],
            where: { email: In(emails) },
        });

        return uniq(users.map((user) => user.email));
    }

    async getRoles(roleName: string[]): Promise<Role[]> {
        const roles = await this.dbManager.find(Role, {
            select: ['id', 'name'],
            where: { name: In(roleName) },
        });

        return uniq(roles);
    }

    async getTaxCodes(taxCode: string[]): Promise<string[]> {
        const users = await this.dbManager.find(User, {
            select: ['taxCode'],
            where: { taxCode: In(taxCode) },
        });

        return uniq(users.map((user) => user.taxCode));
    }

    async getBankAccounts(bankAccounts: string[]): Promise<string[]> {
        const users = await this.dbManager.find(User, {
            select: ['bankAccount'],
            where: { bankAccount: In(bankAccounts) },
        });

        return uniq(users.map((user) => user.bankAccount));
    }

    async getCitizenIds(citizenIds: string[]): Promise<string[]> {
        const users = await this.dbManager.find(User, {
            select: ['citizenId'],
            where: { citizenId: In(citizenIds) },
        });

        return uniq(users.map((user) => user.citizenId));
    }

    async getSocialInsurances(socialInsurances: string[]): Promise<string[]> {
        const users = await this.dbManager.find(User, {
            select: ['socialInsurance'],
            where: { socialInsurance: In(socialInsurances) },
        });

        return uniq(users.map((user) => user.socialInsurance));
    }

    async getProvinces(provinceNames: string[]): Promise<Province[]> {
        const provinces = await this.dbManager.find(Province, {
            select: ['name', 'id'],
            where: { name: In(provinceNames) },
        });

        return uniq(provinces);
    }

    async validateImportUser(
        importUser: ImportUserDto,
        emailList: string[],
        roleList: string[],
        taxCodeList: string[],
        bankAccountList: string[],
        citizenIdList: string[],
        provinceList: string[],
        socialInsuranceList: string[],
    ) {
        const validationResult = {
            isValid: true,
            errors: [],
        };
        const position = (userPositionList || [])
            .map((position) => position?.code)
            .includes(importUser.position);

        if (!position) {
            const errorMessage = await this.i18n.translate(
                'user.common.error.positionId.notExist',
            );
            validationResult.errors.push({
                column: 'position',
                errorMessage,
                errorCode: HttpStatus.ITEM_NOT_FOUND,
            });
            validationResult.isValid = false;
        }

        const user = emailList.find((email) => email === importUser.email);

        if (user) {
            const errorMessage = await this.i18n.translate(
                'user.common.error.email.exist',
            );
            validationResult.errors.push({
                column: 'email',
                errorMessage,
                errorCode: HttpStatus.ITEM_ALREADY_EXIST,
            });
            validationResult.isValid = false;
        }

        const role = roleList.find((role) => role === importUser.role);

        if (!role) {
            const errorMessage = await this.i18n.translate(
                'role.common.error.role.notFound',
            );
            validationResult.errors.push({
                column: 'role',
                errorMessage,
                errorCode: HttpStatus.ITEM_NOT_FOUND,
            });
            validationResult.isValid = false;
        }

        if (importUser.taxCode) {
            const taxCode = taxCodeList.find(
                (taxCode) => taxCode === importUser.taxCode,
            );

            if (taxCode) {
                const errorMessage = await this.i18n.translate(
                    'user.common.error.taxCode.exist',
                );
                validationResult.errors.push({
                    column: 'taxCode',
                    errorMessage,
                    errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                });
                validationResult.isValid = false;
            }
        }

        const bankAccount = bankAccountList.find(
            (bankAccount) => bankAccount === importUser.bankAccount,
        );

        if (bankAccount) {
            const errorMessage = await this.i18n.translate(
                'user.common.error.bankAccount.exist',
            );
            validationResult.errors.push({
                column: 'bankAccount',
                errorMessage,
                errorCode: HttpStatus.ITEM_ALREADY_EXIST,
            });
            validationResult.isValid = false;
        }

        const citizenId = citizenIdList.find(
            (citizenId) => citizenId === importUser.citizenId,
        );

        if (citizenId) {
            const errorMessage = await this.i18n.translate(
                'user.common.error.citizenId.exist',
            );
            validationResult.errors.push({
                column: 'citizenId',
                errorMessage,
                errorCode: HttpStatus.ITEM_ALREADY_EXIST,
            });
            validationResult.isValid = false;
        }

        const province = provinceList.find(
            (province) => province === importUser.province,
        );

        if (!province) {
            const errorMessage = await this.i18n.translate(
                'user.common.error.province.notExist',
            );
            validationResult.errors.push({
                column: 'province',
                errorMessage,
                errorCode: HttpStatus.ITEM_NOT_FOUND,
            });
            validationResult.isValid = false;
        }

        if (importUser.socialInsurance) {
            const socialInsurance = socialInsuranceList.find(
                (socialInsurance) =>
                    socialInsurance === importUser.socialInsurance,
            );

            if (socialInsurance) {
                const errorMessage = await this.i18n.translate(
                    'user.common.error.socialInsurance.exist',
                );
                validationResult.errors.push({
                    column: 'socialInsurance',
                    errorMessage,
                    errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                });
                validationResult.isValid = false;
            }
        }

        return { validationResult, index: importUser.index };
    }

    mapImportUser(
        importUser: ImportUserDto,
        roleList: Role[],
        provinceList: Province[],
        createdBy: number,
    ): CreateUserDto {
        const userRole = roleList.find((role) => role.name === importUser.role);

        if (userRole) {
            importUser.roleId = userRole.id;
        }

        if (importUser.province) {
            const province = provinceList.find(
                (province) => province.name === importUser.province,
            );

            if (province) {
                importUser.provinceId = province.id;
            }
        }

        return { ...importUser, createdBy };
    }

    async bulkCreateUsers(importUsers: CreateUserDto[]) {
        try {
            await getConnection()
                .createQueryBuilder()
                .insert()
                .into(User)
                .values(importUsers)
                .execute();
        } catch (err) {
            throw err;
        }
    }
}
