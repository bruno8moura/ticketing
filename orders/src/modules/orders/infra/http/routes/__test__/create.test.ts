import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../../../../../app';
import { Order, OrderStatus } from '../../../mongoose/entities/Order';
import { Ticket } from '../../../mongoose/entities/Ticket';
import { natsWrapper } from '../../../../../../shared/infra/clients/NATSStreamServer/NATSWrapper';

describe('Create an order', () => {
    it('should returns an error if the ticket does not exist', async () => {
        const ticketId = mongoose.Types.ObjectId();

        await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId })
        .expect(404);
    });

    it('should returns an error if the ticket is already reserved', async () => {
        const ticket = Ticket.build({
            id: mongoose.Types.ObjectId().toHexString(),
            title: 'concert',
            price: 20
        });
        await ticket.save();

        const order = Order.build({
            ticket,
            userId: 'sdfsdf',
            status: OrderStatus.Created,
            expiresAt: new Date()
        });

        await order.save();

        await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(400);
    });

    it('should reserves a ticket', async () => {
        const ticket = Ticket.build({
            id: mongoose.Types.ObjectId().toHexString(),
            title: 'concert',
            price: 20
        });
        await ticket.save();

        await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(201);
    });

    it('emits an order created event', async () => {
        const ticket = Ticket.build({
            id: mongoose.Types.ObjectId().toHexString(),
            title: 'concert',
            price: 20
        });
        await ticket.save();

        await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(201);

        expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
});