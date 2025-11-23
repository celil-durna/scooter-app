import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public globalText =
    'Dieser Text wird in einem Service verwaltet und ist somit unabhängig von Komponenten.';

  constructor() {}

  getText(): string {
    return this.globalText;
  }

  setText(newText: string): void {
    this.globalText = newText;
  }
}
