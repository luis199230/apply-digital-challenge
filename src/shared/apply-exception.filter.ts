import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

type ValidationException = {
  response: {
    message: string[];
  };
};

@Catch()
export class ApplyExceptionFilter implements ExceptionFilter {
  private isValidationException(
    exception: unknown,
  ): exception is ValidationException {
    const validationException = exception as ValidationException;
    return (
      typeof validationException.response === 'object' &&
      validationException.response['message'] &&
      Array.isArray(validationException.response.message)
    );
  }

  catch(exception: unknown, host: ArgumentsHost): FastifyReply {
    const response = host.switchToHttp().getResponse<FastifyReply>();

    let statusCode: number, message: string;

    if (this.isValidationException(exception)) {
      statusCode = 400;
      message = exception.response.message[0];
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.message;
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal Server';
      console.log(exception);
    }

    return response.status(statusCode).send({
      status: false,
      message,
    });
  }
}
