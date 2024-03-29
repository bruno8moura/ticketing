import { NotFoundError, NotAuthorizedError } from '@bcmtickets/common';
import OrderDTO from '../../dtos/OrderDTO';
import { Order } from '../infra/mongoose/entities/Order';

interface IRequest {
    orderId: string;
    userId: string;
}

export default class FindByIdOrderService{
    public async execute({ orderId, userId }: IRequest): Promise<OrderDTO> {
        
        if(!userId){
            throw new NotAuthorizedError();
        }
        
        const order = await Order.findById(orderId).populate('ticket');

        if(!order){
            throw new NotFoundError();
        }

        if(order.userId != userId){
            throw new NotAuthorizedError();
        }

        return {
                id: order.id!, 
                expiresAt: order.expiresAt, 
                status: order.status, 
                userId: order.userId,
                version: order.version, 
                ticket: {
                    id: order.ticket.id!,
                    price: order.ticket.price,
                    title: order.ticket.title,
                    version: order.ticket.version
                } 
        };
    }
}
