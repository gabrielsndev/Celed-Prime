import { Component, inject, OnInit, signal } from '@angular/core';
import { ReservationService } from '../../core/services/reservation.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'cp-my-reservations',
  imports: [ CommonModule, RouterModule],
  templateUrl: './my-reservations.component.html',
  styleUrl: './my-reservations.component.scss',
})
export class MyReservationsComponent implements OnInit{
  private reservationService = inject(ReservationService);

  reservations = signal<any[]>([]);
  currentPage = signal(0);
  totalPages = signal(0);
  loading = signal(true);
  
  selectedPix = signal<{qrCode: string, code: string} | null>(null);

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations(page: number = 0) {
    this.loading.set(true);
    
    this.reservationService.getMyReservations(page, 10).subscribe({
      next: (res) => {
        this.reservations.set(res.content);
        this.totalPages.set(res.totalPages);
        this.currentPage.set(res.number);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar reservas:', err);
        this.loading.set(false);
      }
    });
  }

  showPayment(res: any) {
    this.selectedPix.set({
      qrCode: res.qrCodeBase64,
      code: res.pixCopiaECola
    });
  }

  closePayment() {
    this.selectedPix.set(null);
  }

  copyPix() {
    const code = this.selectedPix()?.code;
    if (code) {
      navigator.clipboard.writeText(code);
      alert('Código PIX copiado com sucesso!');
    }
  }

}
