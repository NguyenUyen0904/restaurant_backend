import { TableColumnOptions } from 'typeorm';

export enum TeamUserRole {
    DEVELOPER = 'developer',
    TESTER = 'tester',
    PROJECTMANAGER = 'project manager',
    INFRA = 'infra',
    ACCOUNTING = 'accounting',
}

export enum TABLE_NAME {
    Users = 'users',
    Files = 'files',
    GeneralSettings = 'general_settings',
    DeviceTypes = 'device_types',
    Roles = 'roles',
    Provinces = 'provinces',
    UserLogging = 'user_logging',
    User_Tokens = 'user_tokens',
    UserPosition = 'user_position',
    Bank = 'banks',
    PermissionActions = 'permission_actions',
    Permissions = 'permissions',
    PermissionResources = 'permission_resources',
    RolePermissions = 'role_permissions',
    Bookings = 'bookings',
    TablesRestaurants = 'tables_restaurants',
    Suppliers = 'suppliers',
    Materials = 'materials',
    ConvertHistories = 'convert_histories',
    ImportMaterials = 'import_materials',
    ImportMaterialOrders = 'import_material_orders',
    ExportMaterials = 'export_materials',
    ExportMaterialOrders = 'export_material_orders',
    CheckInventories = 'check_inventories',
    CheckInventoryDetails = 'check_inventory_details',
    Categories = 'categories',
    Foods = 'foods',
}

export const commonColumns: TableColumnOptions[] = [
    {
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true,
        generationStrategy: 'increment',
    },
    {
        name: 'createdAt',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        isNullable: true,
    },
    {
        name: 'updatedAt',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        isNullable: true,
    },
    {
        name: 'deletedAt',
        type: 'timestamp',
        isNullable: true,
    },
    {
        name: 'createdBy',
        type: 'int',
        isNullable: true,
    },
    {
        name: 'updatedBy',
        type: 'int',
        isNullable: true,
    },
    {
        name: 'deletedBy',
        type: 'int',
        isNullable: true,
    },
];

export enum DBPermissionActions {
    READ = 'read',
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LOGIN = 'login',
    UPDATE_ROLE = 'update_role',
    CONVERT_MATERIAL = 'convert_material',
    APPROVE_STATUS = 'approve_status',
}

export enum DBPermissionResources {
    DASHBOARD = 'dashboard',
    USER = 'user',
    TABLE_DIAGRAM = 'table_diagram',
    BOOKING = 'booking',
    STORE_MATERIAL = 'store_material',
    STORE_CONVERT = 'store_convert',
    STORE_SUPPLIER = 'store_supplier',
    STORE_IMPORT_MATERIAL = 'store_import_material',
    STORE_IMPORT_MATERIAL_DETAIL = 'store_import_material_detail',
    STORE_EXPORT_MATERIAL = 'store_export',
    STORE_EXPORT_MATERIAL_DETAIL = 'store_export_material_detail',
    STORE_CHECK_INVENTORY = 'store_check_inventory',
    STORE_INVENTORY_DETAIL = 'store_inventory_detail',
    ROLE = 'role',
    MENU_FOOD = 'food',
    MENU_CATEGORY = 'category',
}
