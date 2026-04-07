package com.socialnet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.socialnet.dto.request.LoginRequest;
import com.socialnet.dto.request.RegisterRequest;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Auth API Integration Tests")
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired MockMvc     mvc;
    @Autowired ObjectMapper mapper;

    private static final String TEST_EMAIL    = "integration@test.com";
    private static final String TEST_USERNAME = "integrationuser";
    private static final String TEST_PASSWORD = "Password123!";

    @Test @Order(1)
    @DisplayName("POST /api/auth/register — success 200")
    void register_success() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setUsername(TEST_USERNAME);
        req.setEmail(TEST_EMAIL);
        req.setPassword(TEST_PASSWORD);
        req.setFullName("Integration Test");

        mvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.username").value(TEST_USERNAME));
    }

    @Test @Order(2)
    @DisplayName("POST /api/auth/register — duplicate email 400")
    void register_duplicateEmail_returns400() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("another_user");
        req.setEmail(TEST_EMAIL);   // same email
        req.setPassword(TEST_PASSWORD);

        mvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test @Order(3)
    @DisplayName("POST /api/auth/login — success 200")
    void login_success() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmailOrUsername(TEST_USERNAME);
        req.setPassword(TEST_PASSWORD);

        mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty());
    }

    @Test @Order(4)
    @DisplayName("POST /api/auth/login — wrong password 401")
    void login_wrongPassword_returns401() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmailOrUsername(TEST_USERNAME);
        req.setPassword("WrongPassword!");

        mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test @Order(5)
    @DisplayName("POST /api/auth/register — invalid email 400")
    void register_invalidEmail_returns400() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("newuser99");
        req.setEmail("not-an-email");
        req.setPassword(TEST_PASSWORD);

        mvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.email").exists());
    }
}
