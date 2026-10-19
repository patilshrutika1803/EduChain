import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import app from "./app.js";

config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`EduChain API listening on port ${port}`);
});
