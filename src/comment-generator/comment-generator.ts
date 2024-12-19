import { COMMENT_MODE } from "../config";
import { COMMENTS } from "./comments";

export class CommentGenerator {
  private comments = COMMENTS;
  private index: number = 0;

  constructor() {}

  get comment() {
    if (COMMENT_MODE.type === "new-tokens") {
      return this.createCommentMsg();
    } else if (COMMENT_MODE.type === "specific-token") {
      return this.getNextComment();
    } else {
      throw new Error(`Comment mode is not supported.`);
    }
  }

  private getNextComment() {
    // If no comments are available, return a default message
    if (this.comments.length === 0) {
      return "No comments available.";
    }

    // Get the next comment based on the current index
    const comment = this.comments[this.index];

    // Increment the index and reset it if it exceeds the length of the array
    this.index = (this.index + 1) % this.comments.length;

    return comment;
  }

  private createCommentMsg() {
    function randomWord(length: number) {
      const numbers = "23456789";
      const letters = "abcdefghijklmnopqrstuvwxyz";
      const chars = numbers;
      let word = "";
      for (let i = 0; i < length; i++) {
        word += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return word;
    }

    // Define the desired lengths for each word
    const lengthNumber = 3; // Length of the first word
    const lengthWord1 = 5; // Length of the second word
    const lengthWord2 = 5; // Length of the third word
    const lengthWord3 = 5; // Length of the third word

    const number = randomWord(lengthNumber);
    const word1 = randomWord(lengthWord1); // This remains constant as per your example
    const word2 = randomWord(lengthWord2);
    const word3 = randomWord(lengthWord3);

    return `🎁 FREE TOKEN PASSES! (${number}) 🎁  Add "ez" to "pump.fun" 🌐`;
    // return `${word1} ${word2} ${word3}`;
    // return `FREE TOKEN PASSES (${word1}) telegram: ez[underscore]pump[underscore]bot`;
  }
}
