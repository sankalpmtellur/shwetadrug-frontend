import type { Medicine } from "../types";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function isSubsequence(query: string, target: string) {
  let index = 0;
  for (const char of target) {
    if (char === query[index]) index += 1;
    if (index === query.length) return true;
  }
  return false;
}

export function searchMedicines(medicines: Medicine[], query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return medicines;

  return medicines.filter((medicine) => {
    const haystack = [
      medicine.name,
      medicine.genericName,
      medicine.manufacturer,
      medicine.category,
      medicine.sku,
      medicine.pack,
    ].map(normalize);

    return haystack.some(
      (value) =>
        value.includes(normalizedQuery) ||
        (normalizedQuery.length > 2 && isSubsequence(normalizedQuery, value))
    );
  });
}

export function alternativesFor(medicines: Medicine[], medicine: Medicine) {
  return medicines
    .filter(
      (candidate) =>
        candidate.id !== medicine.id &&
        candidate.status !== "Out" &&
        (candidate.category === medicine.category ||
          medicine.alternatives.includes(candidate.id))
    )
    .slice(0, 3);
}
