// Objectif : implémenter la frontière de décision métier propre au dépôt.
import { readFile } from "node:fs/promises";

export const DECISIONS = Object.freeze({
  "priority_bundle": "bouquet_prioritaire",
  "targeted_work": "travaux_ciblés",
  "monitor": "surveillance",
  "no_work": "sans_travaux"
});
const CRITERIA = Object.freeze({
  "priority_bundle": "bouquet prioritaire",
  "targeted_work": "travaux ciblés",
  "monitor": "surveillance",
  "no_work": "sans travaux"
});

export function buildingCase(input) {
  if (!input?.id || !input?.text || !input?.source?.url || !input?.source?.date) throw new TypeError("Le dossier exige id, text, source.url et source.date");
  const date = new Date(input.source.date);
  if (Number.isNaN(date.valueOf())) throw new TypeError("source.date doit être une date ISO valide");
  return { ...input, id: String(input.id), text: String(input.text).trim(), source: { url: String(input.source.url), date: date.toISOString() } };
}

export async function mapDpeWork(input, provider) {
  const record = buildingCase(input);
  if (Array.isArray(record.proposedWorks) && record.proposedWorks.length === 0) return { decision: "no_work", label: DECISIONS["no_work"], probability: 1, review: false, deterministic: true };
  const response = await provider.decide({
    state: record,
    questions: { decision: { type: "choice", instructions: "Analysez ce scénario de travaux à partir des seuls éléments sourcés. Choisissez la catégorie la plus prudente. N’inventez ni fait, ni éligibilité, ni garantie.", criteria: CRITERIA } },
  });
  const answer = response.answers.decision;
  return { decision: answer.choice, label: DECISIONS[answer.choice], probability: answer.probabilities[answer.choice], confidence: answer.confidence, review: answer.confidence < 0.8, deterministic: false, usage: response.usage };
}

export async function runCli(argv, io = console) {
  if (argv.length !== 1) throw new Error("Usage : jev-dpe-travaux-map <dossier.json>");
  const record = buildingCase(JSON.parse(await readFile(argv[0], "utf8")));
  io.log(JSON.stringify({ dossier: record, prochaineÉtape: "Transmettez ce dossier à mapDpeWork avec un fournisseur Jev configuré." }, null, 2));
}
