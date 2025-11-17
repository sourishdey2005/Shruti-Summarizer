
import { Component, ChangeDetectionStrategy, signal, inject, effect, OnDestroy, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService } from './services/gemini.service';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PrivacyPolicyComponent]
})
export class AppComponent implements OnDestroy {
  private readonly geminiService = inject(GeminiService);
  
  articleText = signal<string>('');
  summary = signal<string>('');
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  showPrivacy = signal<boolean>(false);

  // Text-to-Speech state
  isPlaying = signal<boolean>(false);
  isPaused = signal<boolean>(false);
  private utterance: SpeechSynthesisUtterance | null = null;
  
  canGenerate = computed(() => this.articleText().trim().length > 100 && !this.isLoading());
  canPlay = computed(() => this.summary().length > 0 && !this.isLoading());

  constructor() {
    // Clean up speech synthesis on component destruction or page unload.
    window.addEventListener('beforeunload', this.stopAudio.bind(this));
  }
  
  async generateSummaryAndPlay() {
    if (!this.canGenerate()) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.summary.set('');
    this.stopAudio(); // Stop any previous playback

    try {
      const result = await this.geminiService.generateSummary(this.articleText());
      this.summary.set(result);
      // Automatically play after successful generation
      this.playAudio();
    } catch (e) {
      this.error.set('Failed to generate summary. Please check your connection or try again later.');
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  playAudio() {
    if (!this.canPlay()) return;

    const synth = window.speechSynthesis;
    if (!synth) {
      this.error.set('Text-to-Speech is not supported in your browser.');
      return;
    }
    
    if (this.isPaused() && this.utterance) {
      synth.resume();
      this.isPlaying.set(true);
      this.isPaused.set(false);
      return;
    }

    // If currently speaking, stop and restart
    if (synth.speaking) {
      synth.cancel();
    }
    
    this.utterance = new SpeechSynthesisUtterance(this.summary());
    this.utterance.rate = 0.9;
    this.utterance.pitch = 1.1;

    this.utterance.onstart = () => {
      this.isPlaying.set(true);
      this.isPaused.set(false);
    };

    this.utterance.onpause = () => {
      this.isPlaying.set(false);
      this.isPaused.set(true);
    };

    this.utterance.onresume = () => {
      this.isPlaying.set(true);
      this.isPaused.set(false);
    };

    this.utterance.onend = () => {
      this.isPlaying.set(false);
      this.isPaused.set(false);
      this.utterance = null;
    };
    
    this.utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      this.error.set('An error occurred during audio playback.');
      this.isPlaying.set(false);
      this.isPaused.set(false);
    };

    synth.speak(this.utterance);
  }
  
  pauseAudio() {
    const synth = window.speechSynthesis;
    if (synth && this.isPlaying()) {
      synth.pause();
    }
  }

  stopAudio() {
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel(); // Also triggers 'onend' event
    }
  }

  togglePrivacy(show: boolean): void {
    this.showPrivacy.set(show);
  }

  ngOnDestroy(): void {
    this.stopAudio();
    window.removeEventListener('beforeunload', this.stopAudio.bind(this));
  }
}
