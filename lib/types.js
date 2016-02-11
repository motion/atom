'use babel'

/* @flow */

export type Atom$Range = [[number, number], [number, number]]

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
