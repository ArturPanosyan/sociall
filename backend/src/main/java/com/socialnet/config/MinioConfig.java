package com.socialnet.config;

import io.minio.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@Slf4j
public class MinioConfig {

    @Value("${minio.url}")        private String url;
    @Value("${minio.access-key}") private String accessKey;
    @Value("${minio.secret-key}") private String secretKey;

    @Value("${minio.bucket.avatars}") private String avatarsBucket;
    @Value("${minio.bucket.posts}")   private String postsBucket;
    @Value("${minio.bucket.videos}")  private String videosBucket;

    @Bean
    public MinioClient minioClient() {
        MinioClient client = MinioClient.builder()
                .endpoint(url)
                .credentials(accessKey, secretKey)
                .build();

        // Создаём бакеты сразу при создании бина (не в @PostConstruct)
        initBuckets(client);
        return client;
    }

    private void initBuckets(MinioClient client) {
        List<String> buckets = List.of(avatarsBucket, postsBucket, videosBucket);
        for (String bucket : buckets) {
            try {
                boolean exists = client.bucketExists(
                        BucketExistsArgs.builder().bucket(bucket).build());
                if (!exists) {
                    client.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());

                    String policy = """
                        {"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::%s/*"]}]}
                        """.formatted(bucket);

                    client.setBucketPolicy(SetBucketPolicyArgs.builder()
                            .bucket(bucket).config(policy).build());

                    log.info("✅ Bucket created: {}", bucket);
                }
            } catch (Exception e) {
                log.warn("⚠️  Could not init bucket '{}': {}", bucket, e.getMessage());
            }
        }
    }
}
