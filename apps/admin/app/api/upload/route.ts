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

    const asset = await sanityClient.assets.upload("image", buffer, {
      filename,
      contentType: file.type || "image/jpeg",
    });

    return NextResponse.json({ url: asset.url, assetId: asset._id });
  } catch (error) {
    console.error("Failed to upload image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
