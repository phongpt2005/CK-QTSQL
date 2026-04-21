"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseModule = void 0;
const common_1 = require("@nestjs/common");
const warehouses_service_1 = require("./services/warehouses.service");
const locations_service_1 = require("./services/locations.service");
const warehouses_controller_1 = require("./controllers/warehouses.controller");
const locations_controller_1 = require("./controllers/locations.controller");
let WarehouseModule = class WarehouseModule {
};
exports.WarehouseModule = WarehouseModule;
exports.WarehouseModule = WarehouseModule = __decorate([
    (0, common_1.Module)({
        controllers: [warehouses_controller_1.WarehousesController, locations_controller_1.LocationsController],
        providers: [warehouses_service_1.WarehousesService, locations_service_1.LocationsService],
        exports: [warehouses_service_1.WarehousesService, locations_service_1.LocationsService],
    })
], WarehouseModule);
//# sourceMappingURL=warehouse.module.js.map