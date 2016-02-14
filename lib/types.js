'use babel'

/* @flow */

export type Atom$Point = [number, number]
export type Atom$Range = [Atom$Point, Atom$Point]

export type Linter$Message = {
  type: string,
  text?: string,
  html?: string,
  filePath: string,
  range: Atom$Range
}
export type Linter$Provider = {
  setMessages(messages: Array<Linter$Message>): void,
  deleteMessages(): void,
  dispose(): void
}

export type Declarations$Declaration = {
  range: Atom$Range,
  source: {
    filePath: string,
    position: Atom$Point
  }
}
