import {IErrorHandle} from "./types/IErrorHandle";
import {regExps} from "./utils/regExps";

export type Mode = 'encrypt' | 'decrypt';

export const isMode = (value: string): value is Mode => {
  return value === 'encrypt' || value === 'decrypt';
}

export class Crypto {
  private readonly alphabet: string[];
  private readonly key: string;

  public constructor(alphabet: string[], key: string) {
    this.alphabet = alphabet;
    this.key = key;
  }

  public processCipher = (message: string, mode: Mode): IErrorHandle<string> => {
    const toKeyArrayResult = this.toKeyArray(this.key, mode)
    if (toKeyArrayResult.error || !toKeyArrayResult.data) return { error: toKeyArrayResult.error ? 'Key error' : 'toKeyArrayResult.data doesn\'t exist' }
    const shiftResult = this.shift(this.stringToLetters(message), this.generateKeySequence(message.length, toKeyArrayResult.data), mode)
    if (shiftResult.error || !shiftResult.data) return { error: shiftResult.error ?? 'shiftResult.data doesn\'t exist' }
    return { data: this.lettersToString(shiftResult.data) }
  }

  private shift = (letters: string[], keySequence: number[], mode: Mode): IErrorHandle<string[]> => {
    const shiftedLetters: string[] = []
    for (let i = 0; i < letters.length; ++i) {
      const letterIndexInAlphabet = this.findInAlphabet(letters[i]);
      if (letterIndexInAlphabet !== -1) {
        shiftedLetters.push(this.alphabet[this.findIndexOfNewLetter(letterIndexInAlphabet, keySequence[i], mode)])
      } else{
        return { error: `Letter ${letters[i]} doesn't exist in alphabet` }
      }
    }
    return { data: shiftedLetters }
  }

  private generateKeySequence = (messageLength: number, keyArray: number[]) => {
    const sequence: number[] = []
    for (let i = 0; i < messageLength; i++) {
      sequence.push(keyArray[i % keyArray.length])
    }
    return sequence
  }

  private findInAlphabet = (letter: string) => {
    return this.alphabet.indexOf(letter);
  }

  private findIndexOfNewLetter = (oldIndex: number, offset: number, mode: Mode) => {
    const lastIndex = this.alphabet.length - 1;
    switch (mode){
      case "encrypt":
        if (lastIndex < oldIndex + offset) return offset - (lastIndex - oldIndex + 1)
        break
      case "decrypt":
        if (oldIndex + offset < 0) return lastIndex - Math.abs(oldIndex + offset + 1)
        break
    }
    return oldIndex + offset
  }

  private toKeyArray = (stringKey: string, mode: Mode): IErrorHandle<number[]> => {
    const data: number[] = []
    for (let i = 0; i < stringKey.length; i++) {
      if (regExps.digit.test(stringKey[i])) data.push(Number(mode === 'encrypt' ? stringKey[i] : -stringKey[i]));
      else return { error: `Element ${stringKey[i]} is not digit` }
    }
    return { data }
  }

  private stringToLetters = (message: string) => {
    const letters: string[] = []
    for (let i = 0; i < message.length; i++) {
      letters.push(message[i]);
    }
    return letters;
  }

  private lettersToString = (letters: string[]) => {
    return letters.reduce((acc, letter) => {
      return acc + letter
    })
  }
}
