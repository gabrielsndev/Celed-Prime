import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { Router, RouterModule } from '@angular/router';
import { ReservationService } from '../../core/services/reservation.service';

@Component({
  selector: 'cp-new-reservation',
  standalone: true,
  imports: [CommonModule, MatDatepickerModule, MatCardModule, MatNativeDateModule, RouterModule],
  templateUrl: './new-reservation.component.html',
  styleUrl: './new-reservation.component.scss'
})
export class NewReservationComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private router = inject(Router);
  private blockedTimestamps = new Set<number>();

  selectedDate: Date | null = null;
  datesUnavailable: string[] = []; 
  loading = false;
  reservaCriada: any = null;

  ngOnInit() {
    this.loadAvailability();
  }

  onDateSelected(date: Date | null) {
    this.selectedDate = date;
    setTimeout(() => {
      this.gerarResumoDaReserva(); 
    });
  }

  loadAvailability() {
    this.reservationService.getAvailability().subscribe({
      next: (dates) => {
        this.datesUnavailable = dates;
        this.blockedTimestamps = new Set(
          dates.map(d => new Date(d + 'T12:00:00').getTime())
        );
      }
    });
  }

  dateFilter = (d: Date | null): boolean => {
    if (!d) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d < today) return false;
    const timestamp = new Date(d).setHours(12, 0, 0, 0);
    return !this.blockedTimestamps.has(timestamp);
  };

  onConfirmar() {
    if (this.selectedDate) {
      this.loading = true;
      const dateStr = this.selectedDate.toLocaleDateString('sv-SE');
      
      this.reservationService.createReservation({ date: dateStr }).subscribe({
        next: (res) => {
          this.reservaCriada = res;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          alert('Erro ao criar reserva.');
        }
      });
    }
  }


  gerarResumoDaReserva() {
    console.log('Resumo atualizado para:', this.selectedDate);
  }

  copiarPix() {
    if (this.reservaCriada?.pixCopiaECola) {
      navigator.clipboard.writeText(this.reservaCriada.pixCopiaECola);
      alert('Código PIX copiado!');
    }
  }

}