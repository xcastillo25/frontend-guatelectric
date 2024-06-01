import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public message: string
  ) {}

  confirmar(): void {
    this.dialogRef.close(true); // Enviar true al cerrar el dialogo para confirmar
  }

  cancelar(): void {
    this.dialogRef.close(false); // Enviar false al cerrar el dialogo para cancelar
  }
}
