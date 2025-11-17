
import { Component, ChangeDetectionStrategy, output } from '@angular/core';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPolicyComponent {
  close = output<void>();

  onClose() {
    this.close.emit();
  }
}
