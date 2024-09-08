import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import {ALPHABET} from "./constants";
import {Crypto, isMode, Mode} from "./Crypto";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/crypto", (req: Request<{}, {}, {}, { message: string, mode: Mode, key: string }>, res: Response<{ error: string } | string>) => {
  const query = req.query
  if (!query.mode) return res.json({ error: 'mode is require' })
  if (!query.message) return res.json({ error: 'message is require' })
  if (!query.key) return res.json({ error: 'key is require' })
  if (!isMode(query.mode)) return res.json( { error: 'mode is not valid' } )

  const crypto = new Crypto(ALPHABET, req.query.key)
  const response = crypto.processCipher(req.query.message, req.query.mode);
  return res.json(response.error ? { error: response.error } : response.data);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});