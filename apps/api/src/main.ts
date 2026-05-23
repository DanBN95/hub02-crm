import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser') as typeof import('cookie-parser');
import { Logger } from 'nestjs-pino';
import { createCollector } from '@parlex/collector-sdk';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);
  const allowedOrigins = (config.get<string>('WEB_ORIGIN', 'http://localhost:5173'))
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: (requestOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (
        !requestOrigin ||
        allowedOrigins.includes(requestOrigin) ||
        requestOrigin.endsWith('.vercel.app') ||
        requestOrigin.startsWith('http://localhost:')
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${requestOrigin} not allowed`));
      }
    },
    credentials: true,
  });
  app.use(cookieParser());

  // Parlex collector — must come early in the middleware stack
  const parlexMcpUrl = config.get<string>('PARLEX_MCP_URL', '');
  const parlexApiKey = config.get<string>('PARLEX_API_KEY', '');
  if (parlexMcpUrl && parlexApiKey) {
    app.use(
      createCollector({
        mcpUrl: parlexMcpUrl,
        apiKey: parlexApiKey,
        debug: config.get<string>('NODE_ENV', 'development') !== 'production',
      }),
    );
  }
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
}

//

void bootstrap();
