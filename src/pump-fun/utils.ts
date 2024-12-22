export function getCoinSlug(url: string) {
  const urlParts = url.split("/");
  return urlParts[urlParts.length - 1];
}

export function getPumpFunFee(amount: number) {
  return amount * 0.01;
}

export function generateUsername() {
  // Generate unique username
  function generateCustomID(alphabet: string, length: number): string {
    let result = "";
    const characters = alphabet.split("");
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters[Math.floor(Math.random() * charactersLength)];
    }
    return result;
  }
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const id = generateCustomID(alphabet, 7);
  const randomNumber = Math.floor(Math.random() * 10);
  const newUserName = `ez${randomNumber}${id}`; // The whole username must be max 10 characters
  return newUserName;
}
