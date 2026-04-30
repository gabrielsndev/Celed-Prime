import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { Router, RouterModule } from '@angular/router';
import { ReservationService } from '../../core/services/reservation.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
  private sanitizer = inject(DomSanitizer);
  private blockedTimestamps = new Set<number>();
  
  reservaCriada: any = null;
  qrCodeSafeUrl: SafeUrl | null = null;
  selectedDate: Date | null = null;
  datesUnavailable: string[] = []; 
  loading = false;

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

          const base64String = res.qrCodeBase64.includes('base64,') 
            ? res.qrCodeBase64 
            : 'data:image/png;base64,' + res.qrCodeBase64;

          this.qrCodeSafeUrl = this.sanitizer.bypassSecurityTrustUrl(base64String);
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          console.error('Erro ao criar reserva:', err);
          alert(err.error?.message || 'Erro ao processar sua reserva.');
        }
      });
    }
  }

  gerarResumoDaReserva() {
    console.log('Resumo atualizado para:', this.selectedDate);
  }

  voltar() {
    if (this.reservaCriada) {
      this.reservaCriada = null;
    } else {
      this.router.navigate(['/home']);
    }
  }

  copiarPix() {
    if (this.reservaCriada?.pixCopiaECola) {
      navigator.clipboard.writeText(this.reservaCriada.pixCopiaECola);
      alert('Código PIX copiado com sucesso!');
    }
  }

}