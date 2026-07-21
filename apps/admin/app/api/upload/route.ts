import { NextResponse } from "next/server";
import { sanityClient } from "@/shared/lib/sanity/client";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = file instanceof File ? file.name : "upload";
    const contentType = file.type || "application/octet-stream";
    const assetType = contentType.startsWith("image/") ? "image" : "file";

    const asset = await sanityClient.assets.upload(assetType, buffer, {
      filename,
      contentType,
    });

    return NextResponse.json({ url: asset.url, assetId: asset._id });
  } catch (error) {
    console.error("Failed to upload asset:", error);
    return NextResponse.json(
      { error: "Failed to upload asset" },
      { status: 500 }
    );
  }
}
