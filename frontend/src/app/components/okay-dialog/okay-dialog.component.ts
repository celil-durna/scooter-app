import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-okay-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './okay-dialog.component.html',
  styleUrls: ['./okay-dialog.component.css'],
})
export class OkayDialogComponent {
  @Input() visible = false;
  @Input() header = '';
  @Input() message = '';
  @Input() dialogType: 'success' | 'error' = 'success';
  @Output() cancel = new EventEmitter<void>();

  onCancel(): void {
    this.cancel.emit();
    this.visible = false;
  }
}
