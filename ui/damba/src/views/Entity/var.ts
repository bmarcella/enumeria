export const internetProviders = ["natcom", "digicel", "aucun"] as const;
export const verifyOwners = ["Freres et soeurs", "Voisins", "Parents", "Réference","Locataire", "Actuel", "Autre"] as const;
export const whoReferreds = ["Le proprietaire", "Joueurs de loterie dans la region", "Marchands", "entreprises","Ancien agent qui ont vendu à l'emplacement", "Concurents", "Les gens assis autour"] as const;
export const finalDecisionStatuses = [
  "prendre",
  "ne_pas_prendre",
  "besoin_de_plus_de_recherches"
] as const;

export const paymentMethods = ["chèque", "espèces"] as const;
export const previousUses = ["Boutique", "Borlette", "Commercial", "Moncash", "Aucun"] as const;
export const nonRenewalReasons = ["Mauvaise gestion de l'agent", "Autre"] as const;
export const lotteryCompetitions = ["2", "5", "10", "20 ou plus", "Agents ambulants", "Aucun", "Autre"] as const;
export const clientVisibilities = ["Directement dans la rue", "Entrée simple", " Murs pour peindre la publicité", "Espace sur le toit pour peindre le logo" ] as const;
export const buildingStabilities = ["Stable", "Pas stable", "Parfois stable"] as const;
export const bankEntrances = ["Entrée principale", "Entrée de secours", "Pas d'entrée"] as const;
export const populationInAreas = [ "Moins de 5000", "5000", "7000",  "10,000", "20,000", "50,000", "Plus"] as const;
export const expectedRevenue = [ "Moins de 5000HTG", "5000 HTG", "7000 HTG",  "10000 HTG", "20000 HTG" , "50000 HTG ou plus"] as const;
export const openHours = [ "4h du matin", "5h du matin", "7h",  "8h", "9h ou plus tard"] as const;
export const closeHours = [ "16h",  "17h",  "18h", "20h ou plus tard"] as const;
export const currentSecurities = [ "Cadenas",  "Toiture en beton",  "Fenêtre métallique/barrée", "Porte métallique/barrée"] as const;
export const majorRenovations = [ "Nouveau toit en tôle", "Nouveau toit en béton", "Modification structurelle", "Division de la  pièce", "Autre"] as const;
export const minorRenovations = [  "Cadenas", "Nouvelle porte","Réparation des Portes", "Réparation fenêtre", "Murs pour peindre la publicité", "Espace sur le toit pour peindre le logo", "Autre"] as const;
export const paymentStructures = [
  "total",
  "avance",
  "Deuxième Année",
  "autre"
] as const;
export const locationTypes = [
  "bail",
  "sous_location",
  "sous_location_propriétaire_réel",
  "sous_location_propriétaire_actuel"
] as const;
export const locationAreas = [
  "résidentiel",
  "marché",
  "isolé",
  "transport",
  "autre"
] as const;
export const areaStabilities = [
  "oui",
  "non",
  "parfois",
  "criminalité",
  "autre"
] as const;
export const bankSteps = ["REJECTED","NEED_APPROVAL", "NEED_APROBATION", "NEED_CONTRACT", "NEED_RENEVATION", "READY_TO_USE"] as const;