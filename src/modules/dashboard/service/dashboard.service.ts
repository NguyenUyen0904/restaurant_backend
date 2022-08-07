import { Material } from 'src/modules/material/entity/material.entity';
import { ImportMaterial } from './../../import-material/entity/import_material.entity';
import { IRevenueChartListQuery } from '../dashboard.interface';
import { Injectable, Optional, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectEntityManager } from '@nestjs/typeorm';

import { EntityManager, Brackets } from 'typeorm';
import { DateRangeTypes } from '../dashboard.constant';
import { ExportMaterial } from 'src/modules/export-material/entity/export_material.entity';

@Injectable()
export class DashboardService {
    constructor(
        @Optional() @Inject(REQUEST) private readonly request: Request,
        @InjectEntityManager()
        private readonly dbManager: EntityManager,
    ) {}

    generateImportExportChartQueryBuilder(queryBuilder, { dateRanges }) {
        if (dateRanges.length === 2) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where('createdAt BETWEEN :startDay AND :endDay', {
                        startDay: dateRanges[0],
                        endDay: dateRanges[1],
                    });
                }),
            );
        }
    }

    async getImportExportMaterials(query: IRevenueChartListQuery) {
        try {
            const { dateRanges = [], dateRangeType = DateRangeTypes.MONTH } =
                query;

            const importMaterials = await this.dbManager.find(ImportMaterial, {
                where: (queryBuilder) =>
                    this.generateImportExportChartQueryBuilder(queryBuilder, {
                        dateRanges,
                    }),
            });

            const exportMaterials = await this.dbManager.find(ExportMaterial, {
                where: (queryBuilder) =>
                    this.generateImportExportChartQueryBuilder(queryBuilder, {
                        dateRanges,
                    }),
            });

            if (!importMaterials.length) {
                return {
                    items: [],
                };
            }

            if (!exportMaterials.length) {
                return {
                    items: [],
                };
            }

            const paymentMonth: {
                month: number;
                importTotalPayment: number;
                exportTotalPayment: number;
            }[] = [];

            const paymentDay: {
                day: number;
                importTotalPayment: number;
                exportTotalPayment: number;
            }[] = [];

            if (dateRangeType === DateRangeTypes.MONTH) {
                for (let i = 0; i < 14; i++) {
                    paymentMonth.push({
                        month: i,
                        importTotalPayment: 0,
                        exportTotalPayment: 0,
                    });
                }
            } else {
                for (let i = 0; i < 32; i++) {
                    paymentDay.push({
                        day: i,
                        importTotalPayment: 0,
                        exportTotalPayment: 0,
                    });
                }
            }

            importMaterials?.forEach((importMaterial) => {
                if (dateRangeType === DateRangeTypes.MONTH) {
                    const month = importMaterial?.createdAt.getMonth() + 1;
                    paymentMonth[month].importTotalPayment +=
                        importMaterial.totalPaymentImport;
                } else {
                    const day = importMaterial?.createdAt.getDay() + 1;
                    paymentDay[day].importTotalPayment +=
                        importMaterial.totalPaymentImport;
                }
            });

            exportMaterials?.forEach((exportMaterial) => {
                if (dateRangeType === DateRangeTypes.MONTH) {
                    const month = exportMaterial?.createdAt.getMonth() + 1;
                    paymentMonth[month].exportTotalPayment +=
                        exportMaterial.totalPaymentExport;
                } else {
                    const day = exportMaterial?.createdAt.getDay() + 1;
                    paymentDay[day].exportTotalPayment +=
                        exportMaterial.totalPaymentExport;
                }
            });

            return dateRangeType === DateRangeTypes.MONTH
                ? {
                      items: paymentMonth,
                  }
                : {
                      items: paymentDay,
                  };
        } catch (error) {
            throw error;
        }
    }

    async getData(query: IRevenueChartListQuery) {
        try {
            const { dateRanges = [] } = query;

            const [importMaterials, importMaterialCount] =
                await this.dbManager.findAndCount(ImportMaterial, {
                    where: (queryBuilder) =>
                        this.generateImportExportChartQueryBuilder(
                            queryBuilder,
                            {
                                dateRanges,
                            },
                        ),
                });
            let importMaterialTotalPayment = 0;
            if (importMaterials.length) {
                (importMaterials as unknown as ImportMaterial[]).forEach(
                    (item) => {
                        importMaterialTotalPayment += item.totalPaymentImport;
                    },
                );
            }

            const [exportMaterials, exportMaterialCount] =
                await this.dbManager.findAndCount(ExportMaterial, {
                    where: (queryBuilder) =>
                        this.generateImportExportChartQueryBuilder(
                            queryBuilder,
                            {
                                dateRanges,
                            },
                        ),
                });

            let exportMaterialTotalRevenue = 0;
            if (exportMaterials.length) {
                (exportMaterials as unknown as ExportMaterial[]).forEach(
                    (item) => {
                        exportMaterialTotalRevenue += item.totalPaymentExport;
                    },
                );
            }

            return {
                importMaterialTotalPayment,
                importMaterialCount,
                exportMaterialTotalRevenue,
                exportMaterialCount,
            };
        } catch (error) {
            throw error;
        }
    }
}
