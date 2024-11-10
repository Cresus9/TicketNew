import { Prisma } from '@prisma/client';


export class TicketType implements Prisma.TicketTypeCreateInput {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  maxPerOrder: number;
  available: number;
  event: Prisma.EventCreateNestedOneWithoutTicketTypesInput;
  createdAt: Date;
  updatedAt: Date;
}



