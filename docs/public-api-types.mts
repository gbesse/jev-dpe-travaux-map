// Objectif : vérifier que les types publics sont importables.
import { buildingCase, mapDpeWork } from "../src/index.mjs";
const dossier = buildingCase({
  "id": "exemple-1",
  "text": "Maison classée F : isolation des combles et des murs recommandée avant le remplacement du chauffage.",
  "source": {
    "url": "https://example.test/donnee-source",
    "date": "2026-09-15"
  },
  "details": {
    "territoire": "Commune Exemple",
    "origine": "donnée synthétique"
  }
});
void mapDpeWork(dossier, { decide: async () => ({}) });
