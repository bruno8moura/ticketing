import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import './globalfunction';

let mongo: MongoMemoryServer;
process.env.STRIPE_KEY = 'sk_test_51IjKG4CoBZSNeM36IbbB5B3A11nhx0ZA6gRIT8HT6iv0wkjupBU21c4NuvPi6bg54i2abTCTCBL5pFdxRUD1w09d00mUtSbY8u';

beforeAll(async () => {
    process.env.JWT_KEY = 'asdf';
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    jest.clearAllMocks();    
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

