import { NextResponse } from "next/server";

const DATA_URL =
  "https://raw.githubusercontent.com/SvarogMyl/lab-data-service/main/outputs/botica-municipal/data.json";

export async function GET() {
  try {
    const response = await fetch(DATA_URL, {
      next: { revalidate: 300 }, // Cache por 5 minutos, luego revalida
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "No se pudo obtener el catálogo desde el repositorio" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error leyendo el catálogo:", error);
    return NextResponse.json(
      { error: "Error interno al leer los datos" },
      { status: 500 }
    );
  }
}
