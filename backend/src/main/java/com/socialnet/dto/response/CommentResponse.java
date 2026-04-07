package com.socialnet.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class CommentResponse {
    private Long              id;
    private Long              postId;
    private Long              parentId;
    private Long              userId;
    private String            username;
    private String            fullName;
    private String            avatarUrl;
    private String            content;
    private Integer           likesCount;
    private List<CommentResponse> replies;
    private LocalDateTime     createdAt;
}
