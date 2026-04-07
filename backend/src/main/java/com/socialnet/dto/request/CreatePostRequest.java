package com.socialnet.dto.request;

import lombok.Data;

@Data
public class CreatePostRequest {
    private String content;
    private String type;
    private String visibility;
}
