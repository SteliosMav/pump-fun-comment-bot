import { COMMENT_MODE, SAFE_COMMENTS } from "../config";
import { BOOST_COMMENTS } from "./boost-comments";
import { NEUTRAL_COMMENTS } from "./neutral-comments";

export class CommentGenerator {
  private comments = NEUTRAL_COMMENTS;
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

  private createCommentMsg(): string {
    function randomWord(length: number, type: "number" | "letter") {
      const numbers = "23456789";
      const letters = "abcdefghijklmnopqrstuvwxyz";
      const chars = type === "letter" ? letters : numbers;
      let word = "";
      for (let i = 0; i < length; i++) {
        word += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return word;
    }

    const number = randomWord(3, "number");
    const word1 = randomWord(5, "letter");

    if (SAFE_COMMENTS) {
      return this.getNextComment();
    } else {
      return `🎁 FREE passes! (${number}) 🎁  Add "ez" to "pump.fun" 🌐`;
    }
  }
}
