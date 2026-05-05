package com.celedprime.api.infra.config;

import com.mercadopago.MercadoPagoConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;

@Configuration
public class MercadoPagoConfigation {

    @Value("${mercado-pago.access-token}")
    private String accessToken;

    @PostConstruct
    public void init() {

        MercadoPagoConfig.setAccessToken(accessToken);
    }

}
