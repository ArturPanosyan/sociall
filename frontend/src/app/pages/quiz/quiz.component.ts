import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { HttpClient }   from '@angular/common/http';
import { environment }  from '../../../environments/environment';

@Component({
  selector: 'app-quiz', standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div style="max-width:800px;margin:0 auto;padding:20px 16px">

  <div style="margin-bottom:24px">
    <h1 style="font-size:22px;font-weight:500;color:var(--text-primary,#111)">🧠 Quizzes</h1>
    <p style="font-size:13px;color:var(--text-secondary,#6b7280)">Test your knowledge, challenge friends</p>
  </div>

  <!-- Active quiz -->
  @if (activeQuiz && !result()) {
    <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);border-radius:20px;padding:24px">

      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <div>
          <div style="font-size:11px;color:var(--text-secondary,#6b7280);margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px">
            Question {{ currentQ + 1 }} / {{ activeQuiz.questions.length }}
          </div>
          <div style="font-size:18px;font-weight:500;color:var(--text-primary,#111)">{{ activeQuiz.title }}</div>
        </div>
        <div style="font-size:24px;font-weight:600;color:#6366f1">{{ timer }}s</div>
      </div>

      <!-- Progress -->
      <div style="height:4px;background:var(--bg-secondary,#f9fafb);border-radius:10px;margin-bottom:24px;overflow:hidden">
        <div style="height:100%;background:#6366f1;border-radius:10px;transition:width .3s"
             [style.width]="((currentQ+1)/activeQuiz.questions.length*100)+'%'"></div>
      </div>

      <!-- Question -->
      <div style="font-size:18px;font-weight:500;color:var(--text-primary,#111);margin-bottom:20px;line-height:1.5">
        {{ activeQuiz.questions[currentQ].question }}
      </div>

      <!-- Options -->
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px">
        @for (opt of activeQuiz.questions[currentQ].options; track $index; let i = $index) {
          <button (click)="selectAnswer(i)"
                  style="padding:14px 18px;border-radius:12px;text-align:left;font-size:14px;
                         cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:12px"
                  [style.background]="answers[activeQuiz.questions[currentQ].id] === i ? '#e0e7ff' : 'var(--bg-secondary,#f9fafb)'"
                  [style.borderColor]="answers[activeQuiz.questions[currentQ].id] === i ? '#6366f1' : 'var(--border,#e5e7eb)'"
                  style="border:1.5px solid var(--border,#e5e7eb)">
            <div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600"
                 [style.background]="answers[activeQuiz.questions[currentQ].id] === i ? '#6366f1' : 'var(--bg-primary,#fff)'"
                 [style.color]="answers[activeQuiz.questions[currentQ].id] === i ? '#fff' : 'var(--text-secondary,#6b7280)'"
                 [style.border]="answers[activeQuiz.questions[currentQ].id] === i ? 'none' : '1.5px solid var(--border,#e5e7eb)'">
              {{ letters[i] }}
            </div>
            {{ opt }}
          </button>
        }
      </div>

      <!-- Navigation -->
      <div style="display:flex;gap:10px">
        @if (currentQ > 0) {
          <button (click)="currentQ = currentQ - 1"
                  style="flex:1;padding:12px;border:0.5px solid var(--border,#e5e7eb);background:none;border-radius:12px;font-size:14px;cursor:pointer;color:var(--text-secondary,#6b7280)">
            ← Back
          </button>
        }
        @if (currentQ < activeQuiz.questions.length - 1) {
          <button (click)="currentQ = currentQ + 1"
                  style="flex:2;padding:12px;background:#6366f1;color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:500;cursor:pointer">
            Next →
          </button>
        } @else {
          <button (click)="submitQuiz()"
                  style="flex:2;padding:12px;background:#10b981;color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:500;cursor:pointer">
            Submit Quiz ✓
          </button>
        }
      </div>
    </div>
  }

  <!-- Result screen -->
  @if (result()) {
    <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);border-radius:20px;padding:32px;text-align:center">
      <div style="font-size:64px;margin-bottom:16px">
        {{ result()!.score >= 80 ? '🏆' : result()!.score >= 60 ? '🎯' : '📚' }}
      </div>
      <div style="font-size:28px;font-weight:600;color:var(--text-primary,#111);margin-bottom:8px">
        {{ result()!.score }}%
      </div>
      <div style="font-size:15px;color:var(--text-secondary,#6b7280);margin-bottom:24px">
        {{ result()!.score >= 80 ? 'Excellent! You aced it! 🎉' : result()!.score >= 60 ? 'Good job! Keep it up!' : 'Keep practicing! You\'ll get there!' }}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;max-width:300px;margin:0 auto 24px">
        <div style="background:var(--bg-secondary,#f9fafb);border-radius:12px;padding:14px">
          <div style="font-size:22px;font-weight:600;color:#6366f1">{{ result()!.score }}%</div>
          <div style="font-size:12px;color:var(--text-secondary,#6b7280)">Score</div>
        </div>
        <div style="background:var(--bg-secondary,#f9fafb);border-radius:12px;padding:14px">
          <div style="font-size:22px;font-weight:600;color:#10b981">{{ activeQuiz?.questions?.length }}</div>
          <div style="font-size:12px;color:var(--text-secondary,#6b7280)">Questions</div>
        </div>
      </div>
      <div style="display:flex;gap:10px;justify-content:center">
        <button (click)="result.set(null);currentQ=0;answers={};startTimer()"
                style="padding:10px 24px;background:#6366f1;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer">
          Try Again
        </button>
        <button (click)="activeQuiz=null;result.set(null)"
                style="padding:10px 24px;border:0.5px solid var(--border,#e5e7eb);background:none;border-radius:10px;font-size:14px;cursor:pointer;color:var(--text-secondary,#6b7280)">
          All Quizzes
        </button>
      </div>
    </div>
  }

  <!-- Quiz list -->
  @if (!activeQuiz && !result()) {
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px">
      @for (q of quizzes(); track q.id) {
        <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);border-radius:16px;padding:18px;transition:transform .12s" class="quiz-card">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
            <div style="width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px"
                 [style.background]="catColor(q.category)">
              {{ catEmoji(q.category) }}
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:500;color:var(--text-primary,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ q.title }}</div>
              <div style="font-size:11px;color:var(--text-secondary,#6b7280)">{{ q.category }}</div>
            </div>
          </div>
          <div style="display:flex;gap:10px;font-size:12px;color:var(--text-muted,#9ca3af);margin-bottom:14px">
            <span>❓ {{ q.questionsCount }} questions</span>
            <span>▶️ {{ q.playsCount }} plays</span>
          </div>
          <button (click)="startQuiz(q)"
                  style="width:100%;padding:9px;background:#6366f1;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:500;cursor:pointer">
            Start Quiz
          </button>
        </div>
      }

      @if (!quizzes().length) {
        @for (q of sampleQuizzes; track q.title) {
          <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);border-radius:16px;padding:18px" class="quiz-card">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
              <div style="width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px"
                   [style.background]="catColor(q.category)">{{ q.icon }}</div>
              <div><div style="font-size:13px;font-weight:500;color:var(--text-primary,#111)">{{ q.title }}</div>
                <div style="font-size:11px;color:var(--text-secondary,#6b7280)">{{ q.category }}</div></div>
            </div>
            <button (click)="startSample(q)"
                    style="width:100%;padding:9px;background:#6366f1;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:500;cursor:pointer">
              Start Quiz
            </button>
          </div>
        }
      }
    </div>
  }
</div>
<style>.quiz-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.06)}</style>
  `
})
export class QuizComponent implements OnInit {
  quizzes  = signal<any[]>([]);
  activeQuiz: any = null;
  result   = signal<any>(null);
  currentQ = 0;
  answers: Record<number, number> = {};
  timer    = 30;
  letters  = ['A','B','C','D'];
  private timerInterval: any;

  sampleQuizzes = [
    { title:'JavaScript Fundamentals', category:'Tech', icon:'💻',
      questions:[
        { id:1, question:'What does "==" vs "===" mean in JS?', options:['Same thing','== checks value only, === checks type too','=== is faster','None'], correctIndex:1 },
        { id:2, question:'What is a closure?', options:['A design pattern','Function with access to outer scope','A loop','An object'], correctIndex:1 },
        { id:3, question:'What does "async/await" do?', options:['Makes code run faster','Handles promises more cleanly','Runs code in parallel','None'], correctIndex:1 },
      ]},
    { title:'World Geography', category:'General', icon:'🌍',
      questions:[
        { id:1, question:'What is the capital of Australia?', options:['Sydney','Melbourne','Canberra','Brisbane'], correctIndex:2 },
        { id:2, question:'Which is the longest river in the world?', options:['Amazon','Nile','Mississippi','Yangtze'], correctIndex:1 },
        { id:3, question:'How many continents are there?', options:['5','6','7','8'], correctIndex:2 },
      ]},
    { title:'Spring Boot Basics', category:'Tech', icon:'☕',
      questions:[
        { id:1, question:'What annotation creates a REST controller?', options:['@Controller','@RestController','@Service','@Repository'], correctIndex:1 },
        { id:2, question:'What does @Autowired do?', options:['Creates a bean','Injects dependencies','Starts the app','Maps URLs'], correctIndex:1 },
        { id:3, question:'What is application.yml used for?', options:['Database','Configuration','Tests','Security'], correctIndex:1 },
      ]},
  ];

  catColors: Record<string,string> = { Tech:'#e0e7ff', General:'#dcfce7', Science:'#fef3c7', History:'#fce7f3', Sports:'#f0fdf4' };
  catEmojis: Record<string,string> = { Tech:'💻', General:'🌍', Science:'🔬', History:'📜', Sports:'⚽' };

  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/quizzes`).subscribe({
      next: r => this.quizzes.set(r.content || []),
      error: () => {}
    });
  }

  startQuiz(q: any) {
    this.http.get<any>(`${environment.apiUrl}/quizzes/${q.id}`).subscribe({
      next: full => { this.activeQuiz = full; this.currentQ = 0; this.answers = {}; this.startTimer(); }
    });
  }

  startSample(q: any) {
    this.activeQuiz = q;
    this.currentQ = 0;
    this.answers = {};
    this.startTimer();
  }

  startTimer() {
    this.timer = 30;
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.timer > 0) this.timer--;
      else this.nextQuestion();
    }, 1000);
  }

  selectAnswer(idx: number) {
    if (!this.activeQuiz) return;
    this.answers[this.activeQuiz.questions[this.currentQ].id] = idx;
  }

  nextQuestion() {
    if (this.currentQ < (this.activeQuiz?.questions?.length || 0) - 1) {
      this.currentQ++;
      this.startTimer();
    }
  }

  submitQuiz() {
    clearInterval(this.timerInterval);
    const total = this.activeQuiz.questions.length;
    let correct = 0;
    this.activeQuiz.questions.forEach((q: any) => {
      if (this.answers[q.id] === q.correctIndex) correct++;
    });
    const score = Math.round((correct / total) * 100);
    this.result.set({ score, total, correct });
  }

  catColor(c: string) { return this.catColors[c] || '#f3f4f6'; }
  catEmoji(c: string) { return this.catEmojis[c] || '🎯'; }
}
