package com.socialnet.dto;

import lombok.*;

@Builder
@Getter
@Setter
public class HashtagTrendDto {
    private String hashtag;
    private Long count;

    public HashtagTrendDto(String hashtag, Long count) {
        this.hashtag = hashtag;
        this.count = count;
    }
}