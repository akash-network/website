export const deployedOnAkash = [
  "Brev.dev",
  "Venice.ai",
  "Prime Intellect",
  "University of Texas at Austin",
  "Nous Research",
  "Flock.io",
  "Akash Chat API",
  "Akash Chat",
  "Auki",
];

export function getPriorityIndex(title: any) {
  const index = deployedOnAkash.indexOf(title);
  return index === -1 ? deployedOnAkash.length : index;
}
