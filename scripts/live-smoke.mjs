// Objectif : effectuer un appel Jev synthétique uniquement sur demande explicite.
import { createJevClient } from "../src/jev.mjs";
import { mapDpeWork } from "../src/index.mjs";
const client = createJevClient();
const résultat = await mapDpeWork({
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
}, client);
console.log(JSON.stringify({ décision: résultat.decision, confiance: résultat.confidence, usage: résultat.usage }, null, 2));
