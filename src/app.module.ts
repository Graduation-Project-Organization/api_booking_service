import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { MongodbModule } from './config/mongodb.module';
import { HttpModule } from '@nestjs/axios';
import { AuthApiService } from './api-services/auth-api/auth-api.service';
import { JwtStrategy } from './core/jwt-auth-guard/jwt.strategy';
import { RabbitMqConfigModule } from './config/rabbitmq-config.module';
import { APP_FILTER } from '@nestjs/core';
import { CatchAppExceptionsFilter } from './core/error-handling/error.filter';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongodbModule.forRoot(),
    HttpModule,
    RabbitMqConfigModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthApiService,
    JwtStrategy,
    { provide: APP_FILTER, useClass: CatchAppExceptionsFilter },
  ],
})
export class AppModule {}
