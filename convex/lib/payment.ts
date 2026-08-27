export function serviceSecretIsValid(
  provided: string,
  configured: string | undefined
) {
  if (!configured || provided.length !== configured.length) return false;

  let difference = 0;
  for (let index = 0; index < configured.length; index += 1) {
    difference |= provided.charCodeAt(index) ^ configured.charCodeAt(index);
  }
  return difference === 0;
}
