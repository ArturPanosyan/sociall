package com.socialnet.service;

import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    private final MinioClient minioClient;

    @Value("${minio.bucket.avatars}") private String avatarsBucket;
    @Value("${minio.bucket.posts}")   private String postsBucket;
    @Value("${minio.bucket.videos}")  private String videosBucket;

    // ─── Загрузить аватар ─────────────────────────────────────
    public String uploadAvatar(MultipartFile file, String username) {
        return upload(file, avatarsBucket, "avatars/" + username + "/" + UUID.randomUUID());
    }

    // ─── Загрузить медиа поста ────────────────────────────────
    public String uploadPostMedia(MultipartFile file) {
        String bucket = isVideo(file) ? videosBucket : postsBucket;
        return upload(file, bucket, "posts/" + UUID.randomUUID());
    }

    // ─── Удалить файл ─────────────────────────────────────────
    public void deleteFile(String bucket, String objectName) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucket).object(objectName).build());
        } catch (Exception e) {
            log.error("Error deleting file: {}", e.getMessage());
        }
    }

    // ─── Получить временный URL ───────────────────────────────
    public String getPresignedUrl(String bucket, String objectName) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .method(Method.GET)
                            .expiry(1, TimeUnit.HOURS)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Could not generate URL: " + e.getMessage());
        }
    }

    // ─── Внутренний метод загрузки ────────────────────────────
    private String upload(MultipartFile file, String bucket, String objectName) {
        try {
            ensureBucketExists(bucket);
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());
            log.info("File uploaded: {}/{}", bucket, objectName);
            return objectName;
        } catch (Exception e) {
            throw new RuntimeException("File upload failed: " + e.getMessage());
        }
    }

    private void ensureBucketExists(String bucket) throws Exception {
        boolean exists = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucket).build());
        if (!exists) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
            log.info("Bucket created: {}", bucket);
        }
    }

    private boolean isVideo(MultipartFile file) {
        String ct = file.getContentType();
        return ct != null && ct.startsWith("video/");
    }
}
