package com.socialnet.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PostResponse {
    private Long          id;
    private Long          userId;
    private String        username;
    private String        fullName;
    private String        avatarUrl;
    private String        content;
    private List<String>  mediaUrls;
    private String        type;
    private String        visibility;
    private Integer       likesCount;
    private Integer       commentsCount;
    private Integer       sharesCount;
    private Integer       viewsCount;
    private Boolean       isLiked;
    private List<String>  hashtags;
    private LocalDateTime createdAt;
}
