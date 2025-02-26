import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Error } from 'mongoose';
import { QueryFailedError, TypeORMError } from 'typeorm';

interface MongoError {
  driver?: boolean;
  code?: number;
  name?: string;
  statusCode?: number;
  status?: string;
  errmsg: string;
  index?: string;
}

interface ServerError {
  message?: string;
  code?: number;
}

@Catch()
export class CatchAppExceptionsFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const object: ServerError = {};
    console.log(exception);
    object.code = 400;
    const res = host.switchToHttp().getResponse();

    if (
      exception?.response?.message &&
      Array.isArray(exception.response.message)
    ) {
      this.handleNestError(exception.response, object);
    } else if (exception instanceof HttpException) {
      this.handleHttpException(exception, object);
    } else if (process.env.DATABASE_TYPE === 'nosql') {
      // MongoDB error handling
      if (exception.name === 'ValidationError') {
        this.handleMongoValidationError(exception, object);
      } else if (exception.name === 'CastError') {
        this.handleCastError(exception, object);
      } else if (exception.code === 11000) {
        this.handleDuplicationError(exception, object);
      }
    } else {
      // TypeORM error handling
      if (exception instanceof QueryFailedError) {
        this.handleTypeORMError(exception, object);
      } else if (exception instanceof TypeORMError) {
        this.handleTypeORMGenericError(exception, object);
      } else {
        this.internalError(res, exception);
      }
    }
    res.status(object.code).send(object);
  }

  handleDuplicationError(exception: MongoError, object: ServerError) {
    const val = exception.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    object.message = ` duplicate value of ${val} `;
  }

  handleMongoValidationError(
    exception: Error.ValidationError,
    object: ServerError,
  ) {
    object.message = Object.values(exception.errors)
      .map((Err: Error.ValidatorError) => Err.message)
      .join(' and ');
  }

  handleCastError(exception: Error.CastError, object: ServerError) {
    object.message = `invalid ${exception.path} value ${exception.value}`;
  }

  handleNestError(
    exception: { message: string[]; statusCode: number },
    object: ServerError,
  ) {
    object.message = exception.message.join(' and ');
    object.code = exception.statusCode;
  }

  handleHttpException(exception: HttpException, object: ServerError) {
    object.message = exception.message;
    object.code = exception.getStatus();
  }

  internalError(res, exception) {
    if (process.env.Node_Env === 'production') {
      res.status(500).send({ message: 'internal server error', code: 400 });
    } else {
      res.status(500).send({ ...exception });
    }
  }

  // New TypeORM error handlers
  handleTypeORMError(exception: QueryFailedError, object: ServerError) {
    if (exception.message.includes('duplicate')) {
      object.message = 'Duplicate entry found';
    } else {
      object.message = 'Database query failed';
    }
    object.code = 400;
  }

  handleTypeORMGenericError(exception: TypeORMError, object: ServerError) {
    object.message = exception.message;
    object.code = 400;
  }
}
