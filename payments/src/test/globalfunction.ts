import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

interface User {
    email: string;
    id: string;
}

declare global {
    namespace NodeJS {
        interface Global{
            signin(userId?: string): string[];
        }
    }
}

// Tell jest which file we want to fake.
jest.mock('../shared/infra/clients/NATSStreamServer/NATSWrapper'); // Tell jest to use our mock file(__mock__) instead use the real NATS client.
// jest.mock('../shared/infra/clients/stripe'); // Tell jest to use our mock file(__mock__) instead use the real stripe client.

global.signin = (userId?: string): string[] => {
    // Build JWT payload. { id, email }
    const payload: User = {
        id: userId || new mongoose.Types.ObjectId().toHexString(),
        email: 'test@mail.com'
    };

    // Create the JWT!
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build session Object. { jwt: MY-JWT }
    const session = { jwt: token };

    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    // Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // return a string thats the cookie with the encoded data
    return [`express:sess=${base64}`];
};