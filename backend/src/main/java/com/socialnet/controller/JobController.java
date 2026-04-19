package com.socialnet.controller;
import com.socialnet.entity.Job;
import com.socialnet.entity.User;
import com.socialnet.exception.NotFoundException;
import com.socialnet.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/jobs") @RequiredArgsConstructor
public class JobController {
    private final JobRepository  jobRepo;
    private final UserRepository userRepo;

    @GetMapping
    public ResponseEntity<Page<Map<String,Object>>> list(
            @RequestParam(defaultValue="0") int page,
            @RequestParam(required=false) String q,
            @RequestParam(required=false) String type) {
        Pageable p = PageRequest.of(page, 20);
        Page<Job> jobs;
        if (q != null && !q.isBlank()) jobs = jobRepo.search(q, p);
        else if (type != null && !type.isBlank()) jobs = jobRepo.findByStatusAndJobTypeOrderByCreatedAtDesc(Job.JobStatus.OPEN, type, p);
        else jobs = jobRepo.findByStatusOrderByCreatedAtDesc(Job.JobStatus.OPEN, p);
        return ResponseEntity.ok(jobs.map(this::map));
    }

    @PostMapping
    public ResponseEntity<Map<String,Object>> create(@RequestBody CreateJobReq req,
            @AuthenticationPrincipal UserDetails ud) {
        User poster = userRepo.findByUsername(ud.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));
        Job j = Job.builder().poster(poster).title(req.title()).description(req.description())
                .company(req.company()).location(req.location()).salary(req.salary())
                .jobType(req.jobType()).category(req.category()).applyUrl(req.applyUrl()).build();
        return ResponseEntity.ok(map(jobRepo.save(j)));
    }

    private Map<String,Object> map(Job j) {
        Map<String,Object> m = new HashMap<>();
        m.put("id",j.getId()); m.put("title",j.getTitle());
        m.put("description",j.getDescription()!=null?j.getDescription():"");
        m.put("company",j.getCompany()!=null?j.getCompany():"");
        m.put("location",j.getLocation()!=null?j.getLocation():"");
        m.put("salary",j.getSalary()!=null?j.getSalary():"");
        m.put("jobType",j.getJobType()!=null?j.getJobType():"FULL_TIME");
        m.put("category",j.getCategory()!=null?j.getCategory():"Tech");
        m.put("status",j.getStatus().name());
        m.put("applyUrl",j.getApplyUrl()!=null?j.getApplyUrl():"");
        m.put("posterUsername",j.getPoster().getUsername());
        m.put("posterFullName",j.getPoster().getFullName()!=null?j.getPoster().getFullName():j.getPoster().getUsername());
        m.put("createdAt",j.getCreatedAt().toString());
        return m;
    }
    record CreateJobReq(String title, String description, String company, String location,
                         String salary, String jobType, String category, String applyUrl) {}
}
