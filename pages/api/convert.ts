import type { NextApiRequest, NextApiResponse } from "next";
import { marked } from "marked";

const MAX_SIZE = 1 * 1024 * 1024; // 1MB

type SuccessResponse = { html: string; success: true };
type ErrorResponse = { error: string; success: false };

function setCors(res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse | { error: string }>
) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { markdown } = req.body ?? {};

  if (!markdown || typeof markdown !== "string" || markdown.trim() === "") {
    return res
      .status(400)
      .json({ error: "markdown field is required", success: false });
  }

  if (Buffer.byteLength(markdown, "utf8") > MAX_SIZE) {
    return res
      .status(400)
      .json({ error: "Input exceeds 1MB limit", success: false });
  }

  marked.setOptions({ gfm: true, breaks: true });

  const html = await marked.parse(markdown);

  return res.status(200).json({ html, success: true });
}

export const config = {
  api: { bodyParser: { sizeLimit: "1mb" } },
};
