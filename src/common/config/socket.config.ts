import { GatewayMetadata } from '@nestjs/websockets';

export const gatewayConfig: GatewayMetadata = {
  cors: {
    origin: `http://localhost:${process.env.CLIENT_PORT}`,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
};
