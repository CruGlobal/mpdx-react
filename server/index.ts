import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import next from 'next';
import Logging from './logging';
import rollbar from './rollbar';

dotenv.config();

const port = process.env.EXPRESS_PORT;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const nextHandler = app.getRequestHandler();

(async () => {
  try {
    // Middleware
    Logging();

    const server = express();
    await app.prepare();

    // Routes
    server.all('*', (req: Request, res: Response) => {
      return nextHandler(req, res);
    });

    // Server
    server.listen(port, (err?: any) => {
      if (err) throw err;
      // eslint-disable-next-line no-console
      console.log(`> Ready on localhost:${port} - env ${process.env.NODE_ENV}`);
    });
  } catch (e: any) {
    if (dev) {
      // eslint-disable-next-line no-console
      console.log(e);
    } else {
      rollbar.error(e?.message || 'Server Error', e);
    }
    process.exit(1);
  }
})();
