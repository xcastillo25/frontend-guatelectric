import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-recovery-modal',
  standalone: true,
  imports: [],
  templateUrl: './recovery-modal.component.html',
  styleUrl: './recovery-modal.component.css'
})
export class RecoveryModalComponent {
  constructor(public dialogRef: MatDialogRef<RecoveryModalComponent>) {}

  recoverPassword(): void {
    // Lógica para recuperar la contraseña
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}
