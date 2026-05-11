package com.celedprime.api.service;

import com.celedprime.api.dto.ReservationRequestDTO;
import com.celedprime.api.dto.ReservationResponseDTO;
import com.celedprime.api.mapper.ReservationMapper;
import com.celedprime.api.model.Reservation;
import com.celedprime.api.model.User;
import com.celedprime.api.model.enums.ReservationStatus;
import com.celedprime.api.repository.ReservationRepository;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.celedprime.api.infra.exception.BusinessException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ReservationService {
    private final ReservationRepository repository;
    private final UserService userService;

    public ReservationService(ReservationRepository repository, UserService userService) {
        this.repository = repository;
        this.userService = userService;
    }

    public boolean checkAvailability(LocalDate date) {
        Optional<Reservation> reservation = this.repository.findByDate(date);
        return reservation.isPresent() && reservation.get().getStatus() != ReservationStatus.CANCELED;
    }

    public ReservationResponseDTO create(ReservationRequestDTO request, Long userId) {
        LocalDate date = request.date();
        if(checkAvailability(date)) {
            throw new BusinessException("Há agendamento no dia selecionado");
        }

        User user = userService.findEntityById(userId);
        Reservation reserve = ReservationMapper.toEntity(request, user);

        PaymentClient client = new PaymentClient();
        PaymentCreateRequest paymentRequest = PaymentCreateRequest.builder()
                .transactionAmount(new BigDecimal("150.00"))
                .description("Reserva Celed Prime -" + date)
                .paymentMethodId("pix")
                .payer(PaymentPayerRequest.builder()
                        .email(user.getEmail())
                        .firstName(user.getName())
                        .build())
                .build();

        try {
            Payment payment = client.create(paymentRequest);
            var transactionData = payment.getPointOfInteraction().getTransactionData();
            reserve.setPaymentId(payment.getId());
            reserve.setPixCopiaECola(transactionData.getQrCode());
            reserve.setQrCodeBase64(transactionData.getQrCodeBase64());
            this.repository.save(reserve);
            return ReservationMapper.toResponse(reserve);
        } catch (Exception e) {
            throw new BusinessException("Falha na comunicação com o provedor de pagamento. Tente novamente");
        }
    }

    public Page<ReservationResponseDTO> findAllByUser(Long userId, Pageable pageable) {

        User user = userService.findEntityById(userId);
        Page<Reservation> reservations = this.repository.findByUser(user, pageable);
        return reservations.map(ReservationMapper::toResponse);
    }

    @Transactional
    public void adminSoftDeleteReservation(Long id) {
        Reservation reservation = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reserva não encontrada: " + id));

        reservation.setStatus(ReservationStatus.CANCELED);
        repository.save(reservation);
    }

    public List<ReservationResponseDTO> findByMonth(int month, int year) {

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.with(java.time.temporal.TemporalAdjusters.lastDayOfMonth());

        List<Reservation> reservations = repository.findByDateBetween(startDate, endDate);
        List<ReservationResponseDTO> response = new ArrayList<>();

        for(Reservation reserve: reservations) {
            if(reserve.getStatus() != ReservationStatus.CANCELED) {
                response.add(ReservationMapper.toResponse(reserve));
            }
        }
        return response;
    }

    public List<LocalDate> getAvailabilityRange(int monthsAhead) {
        int limit = Math.min(monthsAhead, 12);

        LocalDate start = LocalDate.now();
        LocalDate end = start.plusMonths(limit);

        return repository.findAllByDateBetween(start, end)
                .stream()
                .map(Reservation::getDate)
                .distinct()
                .toList();
    }



    public void updatePaymentStatus(Long paymentId) {
        PaymentClient client = new PaymentClient();
        try {
            Payment payment = client.get(paymentId);
            String status = payment.getStatus();

            repository.findByPaymentId(paymentId).ifPresent(reservation -> {
                if ("approved".equals(status)) {
                    reservation.setStatus(ReservationStatus.CONFIRMED);
                } else if ("cancelled".equals(status) || "rejected".equals(status)) {
                    reservation.setStatus(ReservationStatus.CANCELED);
                }
                repository.save(reservation);
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
