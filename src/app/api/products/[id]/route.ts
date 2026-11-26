import { NextRequest, NextResponse } from "next/server";

interface FirestoreValue {
  stringValue?: string;
  arrayValue?: { values?: FirestoreValue[] };
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
      return NextResponse.json({ error: "Missing project ID" }, { status: 500 });
    }

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${encodeURIComponent(id)}?mask.fieldPaths=description&mask.fieldPaths=descriptionImages`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 404) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!res.ok) {
      throw new Error(`Firestore REST API error: ${res.status}`);
    }

    const doc = (await res.json()) as {
      fields?: Record<string, FirestoreValue>;
    };
    const f = doc.fields ?? {};
    const description = f.description?.stringValue ?? "";
    const descriptionImages = (f.descriptionImages?.arrayValue?.values ?? [])
      .map((v) => v.stringValue ?? "")
      .filter(Boolean);

    return NextResponse.json(
      {
        id,
        description,
        descriptionImages,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("GET /api/products/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to load product details" },
      { status: 500 }
    );
  }
}
