export const roleAttributesList = [
    'role.id',
    'role.name',
    'role.description',
    'rolePermission.permissionId',
];

export enum ModuleName {
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
}

export enum PermissionResources {
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
}

export enum PermissionActions {
    READ = 'read',
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LOGIN = 'login',
    UPDATE_ROLE = 'update_role',
    CONVERT_MATERIAL = 'convert_material',
}
