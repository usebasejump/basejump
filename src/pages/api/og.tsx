import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const config = {
  runtime: "experimental-edge",
};

export default function SocialImage(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const hasTitle = searchParams.has("title");
    const title = hasTitle ? searchParams.get("title")?.slice(0, 100) : "";
    console.log("title found", title);
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 80,
            color: "white",
            fontWeight: "bolder",
            background:
              "linear-gradient(117deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            padding: 40,
            textAlign: "left",
            alignItems: "flex-end",
            justifyContent: "flex-start",
          }}
        >
          {title}
        </div>
      ),
      {
        width: 1200,
        height: 600,
      }
    );
  } catch (e) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate an image`, {
      status: 500,
    });
  }
}
