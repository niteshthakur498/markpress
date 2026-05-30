import type { NextApiRequest, NextApiResponse } from "next";
import { marked } from "marked";
import formidable, { File } from "formidable";
import fs from "fs/promises";
import path from "path";

const MAX_SIZE = 1 * 1024 * 1024; // 1MB

type SuccessResponse = { html: string; success: true; filename: string };
type ErrorResponse = { error: string; success: false };

function setCors(res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function parseForm(
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const form = formidable({ maxFileSize: MAX_SIZE, keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
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

  let parsed: { fields: formidable.Fields; files: formidable.Files };
  try {
    parsed = await parseForm(req);
  } catch {
    return res
      .status(400)
      .json({ error: "Failed to parse file upload", success: false });
  }

  const fileField = parsed.files["file"];
  if (!fileField) {
    return res.status(400).json({
      error: "No file uploaded or invalid file type",
      success: false,
    });
  }

  const file: File = Array.isArray(fileField) ? fileField[0] : fileField;
  const originalName = file.originalFilename ?? "upload";
  const ext = path.extname(originalName).toLowerCase();

  if (ext !== ".md" && ext !== ".txt" && ext !== ".markdown") {
    return res.status(400).json({
      error: "No file uploaded or invalid file type",
      success: false,
    });
  }

  const content = await fs.readFile(file.filepath, "utf-8");

  marked.setOptions({ gfm: true, breaks: true });
  const html = await marked.parse(content);

  const outputFilename =
    path.basename(originalName, ext) + ".html";

  return res.status(200).json({ html, success: true, filename: outputFilename });
}

export const config = {
  api: { bodyParser: false },
};
