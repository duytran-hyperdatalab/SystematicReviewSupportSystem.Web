import type { PdfHighlightCoordinate } from "../types";

function toFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function coordinateKey(coordinate: PdfHighlightCoordinate): string {
  return [coordinate.page, coordinate.x, coordinate.y, coordinate.w, coordinate.h].join("|");
}

function dedupeCoordinates(
  coordinates: PdfHighlightCoordinate[]
): PdfHighlightCoordinate[] {
  const seen = new Set<string>();

  return coordinates.filter((coordinate) => {
    const key = coordinateKey(coordinate);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function normalizeCoordinateEntry(entry: unknown): PdfHighlightCoordinate | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const coordinate = entry as Record<string, unknown>;
  const page = toFiniteNumber(coordinate.page ?? coordinate.pageIndex);
  const x = toFiniteNumber(coordinate.x ?? coordinate.left);
  const y = toFiniteNumber(coordinate.y ?? coordinate.top);
  const width = toFiniteNumber(coordinate.w ?? coordinate.width);
  const height = toFiniteNumber(coordinate.h ?? coordinate.height);

  if (
    page === null ||
    x === null ||
    y === null ||
    width === null ||
    height === null
  ) {
    return null;
  }

  return {
    page,
    x,
    y,
    w: width,
    h: height,
  };
}

function parseLegacyCoordinateString(value: string): PdfHighlightCoordinate[] {
  return value
    .split(";")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .flatMap((entry) => {
      const parts = entry.split(",").map((part) => Number(part.trim()));
      if (parts.length < 5 || parts.some((part) => Number.isNaN(part))) {
        return [];
      }

      const [page, x, y, height, width] = parts;
      return [
        {
          page,
          x,
          y,
          w: width,
          h: height,
        },
      ];
    });
}

function parseCoordinateCollection(value: unknown): PdfHighlightCoordinate[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => {
      if (Array.isArray(entry) && entry.length >= 5) {
        const [page, x, y, width, height] = entry.map((item) => Number(item));
        if ([page, x, y, width, height].some((item) => Number.isNaN(item))) {
          return [];
        }

        return [
          {
            page,
            x,
            y,
            w: width,
            h: height,
          },
        ];
      }

      const nested = normalizeCoordinateEntry(entry);
      return nested ? [nested] : [];
    });
  }

  const singleCoordinate = normalizeCoordinateEntry(value);
  return singleCoordinate ? [singleCoordinate] : [];
}

export function parseEvidenceCoordinates(
  coordinatesString: string | null | undefined
): PdfHighlightCoordinate[] {
  const normalizedValue = (coordinatesString ?? "").trim();

  if (!normalizedValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(normalizedValue) as unknown;

    if (parsed && typeof parsed === "object" && "areas" in parsed) {
      return parseCoordinateCollection((parsed as { areas?: unknown }).areas);
    }

    return parseCoordinateCollection(parsed);
  } catch {
    return parseLegacyCoordinateString(normalizedValue);
  }
}

export function serializeEvidenceCoordinates(
  coordinates: PdfHighlightCoordinate[] | null | undefined
): string | null {
  if (!coordinates || coordinates.length === 0) {
    return null;
  }

  return JSON.stringify(dedupeCoordinates(coordinates));
}

export function mergeEvidenceCoordinates(
  existingCoordinatesString: string | null | undefined,
  additionalCoordinates: PdfHighlightCoordinate[] | null | undefined
): string | null {
  const existingCoordinates = parseEvidenceCoordinates(existingCoordinatesString);
  const nextCoordinates = additionalCoordinates ?? [];

  return serializeEvidenceCoordinates([...existingCoordinates, ...nextCoordinates]);
}
