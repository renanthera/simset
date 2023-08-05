import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { getType } from './../../../utils/MimeTypes.js';

export async function GET(
  request: Request,
  { params }: { params: { path: string } }
) {
  const filename = params.path[params.path.length-1].split('.')
  const filetype = filename[filename.length-1]
  const file = await readFile(join(process.cwd(), "src", "data", ...params.path), { encoding: "utf-8"});
  return new Response(file, { headers: { "content-type": getType(filetype) }});
}
