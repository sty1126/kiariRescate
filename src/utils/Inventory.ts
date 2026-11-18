export interface Clue {
  id: string;
  title: string;
  text: string;
}

export class Inventory {
  private static clues: Clue[] = [];

  static add(clue: Clue): void {
    if (!this.clues.find(c => c.id === clue.id)) {
      this.clues.push(clue);
    }
  }

  static getAll(): Clue[] {
    return [...this.clues];
  }

  static has(id: string): boolean {
    return this.clues.some(c => c.id === id);
  }

  static clear(): void {
    this.clues = [];
  }
}
