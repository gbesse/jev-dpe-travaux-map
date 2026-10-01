// Objectif : vérifier la normalisation, la règle déterministe et la décision sémantique.
import test from "node:test";
import assert from "node:assert/strict";
import { buildingCase, mapDpeWork } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const edge = {
  "id": "limite-1",
  "text": "Cas synthétique traité par une règle déterministe avant toute analyse sémantique.",
  "source": {
    "url": "https://example.test/cas-limite",
    "date": "2026-09-16"
  },
  "proposedWorks": []
};
test("exige une source", () => assert.throws(() => buildingCase({ id: "x", text: "y" }), /source/));
test("applique le cas limite sans appel Jev", async () => { const provider = createFakeProvider(() => { throw new Error("appel interdit"); }); assert.equal((await mapDpeWork(edge, provider)).decision, "no_work"); assert.equal(provider.calls, 0); });
test("classe un dossier sourcé", async () => { const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "priority_bundle", probabilities: {
  "priority_bundle": 0.85,
  "targeted_work": 0.05,
  "monitor": 0.05,
  "no_work": 0.05
}, confidence: 0.85 } }, usage: { input_tokens: 10, output_tokens: 0 } })); const result = await mapDpeWork({
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
}, provider); assert.equal(result.decision, "priority_bundle"); assert.equal(result.review, false); });

const dossierÀRevoir = {
  "id": "revue-1",
  "text": "Le DPE recommande plusieurs gestes, mais les contraintes du bâti ne permettent pas encore de confirmer un bouquet cohérent.",
  "source": {
    "url": "https://example.test/dossier-ambigu",
    "date": "2026-09-20"
  },
  "details": {
    "origine": "donnée synthétique",
    "signal": "informations incomplètes"
  }
};

test("marque une décision incertaine pour revue humaine", async () => {
  const provider = createFakeProvider(() => ({
    model: "jev-1.13.0",
    answers: {
      decision: {
        type: "choice",
        choice: "targeted_work",
        probabilities: {
          priority_bundle: 0.15,
          targeted_work: 0.55,
          monitor: 0.15,
          no_work: 0.15,
        },
        confidence: 0.62,
      },
    },
    usage: { input_tokens: 10, output_tokens: 0 },
  }));
  const résultat = await mapDpeWork(dossierÀRevoir, provider);
  assert.equal(résultat.decision, "targeted_work");
  assert.equal(résultat.review, true);
  assert.equal(résultat.confidence, 0.62);
  assert.equal(provider.calls, 1);
});
