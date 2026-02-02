export const deployedOnAkash = [
  "AkashML",
  "NVIDIA",
  "Venice.ai",
  "Prime Intellect",
  "University of Texas at Austin",
  "Nous Research",
  "Eliza",
  "Morpheus",
  "Flock.io",
  "Akash Chat",
  "Auki",
  "Bagel",
  "Levangie Laboratories",
  "yesnoerror",
  "Vertical AI",
  "Bless",
  "Grid",
  "VPS AI",
  "Saga",
];

export function getPriorityIndex(title: string): number {
  const index = deployedOnAkash.indexOf(title);
  return index === -1 ? deployedOnAkash.length : index;
}
