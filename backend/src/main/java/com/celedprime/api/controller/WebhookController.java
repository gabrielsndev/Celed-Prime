package com.celedprime.api.controller;

import com.celedprime.api.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("reserve/webhook")
public class WebhookController {

    @Autowired
    private ReservationService service;


    @PostMapping
    public ResponseEntity<Void> handleWebhook(
            @RequestParam("data.id") String paymentId,
            @RequestParam("type") String type) {

        // Só nos interessa notificações de pagamento
        if ("payment".equals(type)) {
            service.updatePaymentStatus(Long.valueOf(paymentId));
        }

        // SEMPRE retorne 200 ou 201 para o Mercado Pago não achar que deu erro
        return ResponseEntity.ok().build();
    }

}
