import { Prisma } from '@prisma/client';

export type CreateVehicleData = Prisma.VehicleCreateInput;
export type UpdateVehicleData = Prisma.VehicleUpdateInput;

export interface UpdateVehicleParams {
  id: string;
  data: UpdateVehicleData;
}

export interface FindManyVehiclesParams {
  where?: Prisma.VehicleWhereInput;
  skip?: number;
  take?: number;
  orderBy?: Prisma.VehicleOrderByWithRelationInput;
}
