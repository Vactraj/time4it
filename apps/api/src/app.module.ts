import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import {EventsModule} from "./events/events.module";
import {RealtimeModule} from "./realtime/realtime.module";
import {OrdersModule} from "./orders/orders.module";
import {UploadsModule} from "./uploads/uploads.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
        PORT: Joi.number().default(4000),
        MONGO_URI: Joi.string().uri({ scheme: ['mongodb', 'mongodb+srv'] }).required(),
        REDIS_URL: Joi.string().uri().optional(),
        MINIO_ENDPOINT: Joi.string().uri().optional(),
        MINIO_ACCESS_KEY: Joi.string().default('minioadmin'),
        MINIO_SECRET_KEY: Joi.string().default('minioadmin'),
        MINIO_BUCKET: Joi.string().default('uploads'),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGO_URI'),
        dbName: 'app',
      }),
    }),
    EventsModule,
    RealtimeModule,
    OrdersModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
