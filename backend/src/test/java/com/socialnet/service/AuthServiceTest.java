package com.socialnet.service;

import com.socialnet.dto.request.LoginRequest;
import com.socialnet.dto.request.RegisterRequest;
import com.socialnet.dto.response.AuthResponse;
import com.socialnet.entity.User;
import com.socialnet.exception.BadRequestException;
import com.socialnet.repository.UserRepository;
import com.socialnet.security.jwt.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {

    @Mock UserRepository         userRepository;
    @Mock PasswordEncoder        passwordEncoder;
    @Mock JwtUtil                jwtUtil;
    @Mock AuthenticationManager  authManager;
    @Mock UserDetailsService     userDetailsService;
    @Mock RedisTemplate<String, String> redisTemplate;

    @InjectMocks AuthService authService;

    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFullName("Test User");
    }

    @Test
    @DisplayName("Register - success")
    void register_success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");

        User savedUser = User.builder()
                .id(1L).username("testuser").email("test@example.com")
                .role(User.Role.USER).status(User.UserStatus.ACTIVE)
                .isVerified(false).build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        var mockDetails = mock(org.springframework.security.core.userdetails.UserDetails.class);
        when(mockDetails.getUsername()).thenReturn("testuser");
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(mockDetails);
        when(jwtUtil.generateToken(any())).thenReturn("access_token");
        when(jwtUtil.generateRefreshToken(any())).thenReturn("refresh_token");

        AuthResponse response = authService.register(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access_token");
        assertThat(response.getUser().getUsername()).isEqualTo("testuser");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Register - email already exists")
    void register_emailAlreadyExists_throwsBadRequest() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Email");
    }

    @Test
    @DisplayName("Register - username already taken")
    void register_usernameTaken_throwsBadRequest() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Username");
    }
}
