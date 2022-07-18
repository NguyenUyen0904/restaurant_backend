import { CommonListResponse } from 'src/common/helpers/api.response';
import { UserStatus } from 'src/modules/user/user.constant';

export class ListUserDropdown extends CommonListResponse<UserDropdownResponseDto> {
    items: UserDropdownResponseDto[];
}

export class ListRoleDropdown extends CommonListResponse<RoleDropdownResponseDto> {
    items: RoleDropdownResponseDto[];
}

export class ListMaterialDropdown extends CommonListResponse<MaterialDropdownResponseDto> {
    items: MaterialDropdownResponseDto[];
}

export class ListSupplierDropdown extends CommonListResponse<SupplierDropdownResponseDto> {
    items: SupplierDropdownResponseDto[];
}

export class ListBankDropdown extends CommonListResponse<BankDropdownResponseDto> {
    items: BankDropdownResponseDto[];
}
export class ListProvinceDropdown extends CommonListResponse<ProvinceDropdownResponseDto> {
    items: ProvinceDropdownResponseDto[];
}
export class RoleDropdownResponseDto {
    id: number;
    name: string;
}

export class MaterialDropdownResponseDto {
    id: number;
    material: string;
    unit: string;
    quantity: number;
}

export class SupplierDropdownResponseDto {
    id: number;
    name: string;
}
export class BankDropdownResponseDto {
    id: number;
    name: string;
    code: string;
}
export class ProvinceDropdownResponseDto {
    id: number;
    name: string;
}

class UserDropdownResponseDto {
    id: number;
    fullName: string;
    status: UserStatus;
}
